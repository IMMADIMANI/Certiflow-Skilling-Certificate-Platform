import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';
import { validateCandidateRow, ValidationError } from '../../utils/validators';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function createBatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tc = await prisma.trainingCentre.findUnique({ where: { userId: req.user!.userId } });
    if (!tc) {
      res.status(400).json({ error: 'Training centre not found for this user. Please contact admin.' });
      return;
    }
    const { title, description, courseType, courseDuration } = req.body;
    if (!title || !courseType || !courseDuration) {
      res.status(400).json({ error: 'Title, courseType and courseDuration are required' });
      return;
    }
    const batch = await prisma.batch.create({
      data: { trainingCentreId: tc.id, title, description, courseType, courseDuration, status: 'DRAFT' },
    });
    await createAuditLog({
      userId: req.user!.userId,
      action: 'CREATE_BATCH',
      entityType: 'BATCH',
      entityId: batch.id,
      batchId: batch.id,
      newStatus: 'DRAFT',
    });
    res.status(201).json(batch);
  } catch (err) {
    console.error('[Batch] Create error:', err);
    res.status(500).json({ error: 'Failed to create batch' });
  }
}

export async function getBatches(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    let where: any = {};

    if (user.role === 'TRAINING_CENTRE') {
      const tc = await prisma.trainingCentre.findUnique({ where: { userId: user.userId } });
      if (!tc) { res.json([]); return; }
      where = { trainingCentreId: tc.id };
    } else if (user.role === 'DISTRICT_OFFICER') {
      where = { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'RETURNED'] } };
    } else if (user.role === 'QUALITY_TEAM') {
      where = { status: 'QUALITY_REVIEW' };
    }
    // STATE_OFFICE sees all (where = {})

    const batches = await prisma.batch.findMany({
      where,
      include: {
        trainingCentre: { include: { district: true } },
        _count: { select: { candidates: true, certificates: true } },
        districtApprovals: { include: { officer: { select: { name: true, email: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(batches);
  } catch (err) {
    console.error('[Batch] GetBatches error:', err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
}

export async function getBatchById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params['id'] as string },
      include: {
        trainingCentre: {
          include: {
            district: true,
            user: { select: { name: true, email: true } },
          },
        },
        candidates: { orderBy: { name: 'asc' } },
        districtApprovals: {
          include: { officer: { select: { name: true, email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        qualityReviews: { include: { reviewer: { select: { name: true } } } },
        stateApprovals: { include: { officer: { select: { name: true } } } },
        certificates: {
          include: { candidate: { select: { name: true } } },
          orderBy: { issuedAt: 'desc' },
        },
      },
    });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
    res.json(batch);
  } catch {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
}

export async function uploadCandidates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const batchId = req.params['id'] as string;
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
    if (!['DRAFT', 'RETURNED'].includes(batch.status)) {
      res.status(400).json({ error: 'Can only upload candidates to DRAFT or RETURNED batches' });
      return;
    }
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Clean up the file immediately
    try { fs.unlinkSync(req.file.path); } catch {}

    if (rows.length === 0) {
      res.status(422).json({ error: 'File is empty or has no data rows after the header' });
      return;
    }

    // Validate ALL rows first — collect all errors
    const allErrors: ValidationError[] = [];
    const phonesInFile = new Map<string, number>();
    const aadharsInFile = new Map<string, number>();

    rows.forEach((row, idx) => {
      const rowErrors = validateCandidateRow(row, idx);
      allErrors.push(...rowErrors);

      const phone = String(row.phone || '').trim();
      if (phone && /^\d{10}$/.test(phone)) {
        if (phonesInFile.has(phone)) {
          allErrors.push({ row: idx + 2, field: 'phone', message: `Duplicate phone ${phone} (also at row ${phonesInFile.get(phone)})` });
        } else {
          phonesInFile.set(phone, idx + 2);
        }
      }

      const aadhar = String(row.aadhar || '').trim();
      if (aadhar && /^\d{12}$/.test(aadhar)) {
        if (aadharsInFile.has(aadhar)) {
          allErrors.push({ row: idx + 2, field: 'aadhar', message: `Duplicate aadhar (also at row ${aadharsInFile.get(aadhar)})` });
        } else {
          aadharsInFile.set(aadhar, idx + 2);
        }
      }
    });

    if (allErrors.length > 0) {
      res.status(422).json({
        errors: allErrors,
        message: `${allErrors.length} validation error(s) found. No data was saved. Please fix the errors and upload again.`,
      });
      return;
    }

    // All valid — save atomically
    await prisma.$transaction(async (tx) => {
      await tx.candidate.deleteMany({ where: { batchId } });
      await tx.candidate.createMany({
        data: rows.map((row) => ({
          batchId,
          name: String(row.name).trim(),
          fatherName: String(row.fatherName).trim(),
          dob: new Date(row.dob),
          phone: String(row.phone).trim(),
          email: row.email ? String(row.email).trim() || null : null,
          aadhar: row.aadhar ? String(row.aadhar).trim() || null : null,
          courseCompleted: String(row.courseCompleted).trim(),
          completionDate: new Date(row.completionDate),
          marks: row.marks ? parseFloat(String(row.marks)) || null : null,
          grade: row.grade ? String(row.grade).trim() || null : null,
          status: 'PENDING',
        })),
      });
    });

    await createAuditLog({
      userId: req.user!.userId,
      action: 'UPLOAD_CANDIDATES',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      remarks: `Uploaded ${rows.length} candidates`,
    });

    res.json({ message: `Successfully uploaded ${rows.length} candidates`, count: rows.length });
  } catch (err) {
    console.error('[Batch] Upload error:', err);
    if (req.file) try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ error: 'Failed to process file' });
  }
}

export async function submitBatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const batchId = req.params['id'] as string;
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { _count: { select: { candidates: true } } },
    });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
    if (!['DRAFT', 'RETURNED'].includes(batch.status)) {
      res.status(400).json({ error: 'Batch cannot be submitted in its current status' });
      return;
    }
    if (batch._count.candidates === 0) {
      res.status(400).json({ error: 'Please upload candidates before submitting' });
      return;
    }
    const updated = await prisma.batch.update({
      where: { id: batchId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
    await createAuditLog({
      userId: req.user!.userId,
      action: 'SUBMIT_BATCH',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: batch.status,
      newStatus: 'SUBMITTED',
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to submit batch' });
  }
}

export async function getOverdueBatches(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const batches = await prisma.batch.findMany({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        submittedAt: { lt: cutoff },
      },
      include: {
        trainingCentre: { select: { name: true } },
        _count: { select: { candidates: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch overdue batches' });
  }
}
