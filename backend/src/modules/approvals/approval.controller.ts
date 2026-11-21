import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';

const QUALITY_THRESHOLD = parseInt(process.env.QUALITY_REVIEW_THRESHOLD || '50');

export async function getDistrictBatches(req: AuthRequest, res: Response): Promise<void> {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: {
        trainingCentre: { include: { district: true } },
        _count: { select: { candidates: true } },
        districtApprovals: { include: { officer: { select: { name: true, email: true } } } },
      },
      orderBy: { submittedAt: 'asc' },
    });
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
}

export async function approveBatch(req: AuthRequest, res: Response): Promise<void> {
  const batchId = req.params['id'] as string;
  const { remarks } = req.body;
  const officerId = req.user!.userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch with lock to prevent concurrent issues
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
        include: {
          _count: { select: { candidates: true } },
          districtApprovals: true,
        },
      });

      if (!batch) throw Object.assign(new Error('Batch not found'), { code: 'NOT_FOUND' });
      if (!['SUBMITTED', 'UNDER_REVIEW'].includes(batch.status)) {
        throw Object.assign(new Error('Batch is not awaiting district approval'), { code: 'INVALID_STATUS' });
      }
      const alreadyApproved = batch.districtApprovals.find(
        (a) => a.officerId === officerId && a.decision === 'APPROVED'
      );
      if (alreadyApproved) {
        throw Object.assign(new Error('You have already approved this batch'), { code: 'ALREADY_APPROVED' });
      }

      // Create the approval record (unique constraint ensures no duplicates)
      await tx.districtApproval.create({
        data: { batchId, officerId, decision: 'APPROVED', remarks: remarks || null },
      });

      const approvedCount =
        batch.districtApprovals.filter((a) => a.decision === 'APPROVED').length + 1;

      let newStatus: string = 'UNDER_REVIEW';
      if (approvedCount >= 2) {
        newStatus =
          batch._count.candidates >= QUALITY_THRESHOLD ? 'QUALITY_REVIEW' : 'STATE_REVIEW';
      }

      const updated = await tx.batch.update({
        where: { id: batchId },
        data: { status: newStatus as any },
      });

      return { batch: updated, approvedCount, newStatus };
    });

    await createAuditLog({
      userId: officerId,
      action: 'APPROVE_BATCH',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: 'SUBMITTED',
      newStatus: result.newStatus,
      remarks: `District approval #${result.approvedCount}`,
    });

    res.json({
      message: `Batch approved (${result.approvedCount}/2 approvals)`,
      batch: result.batch,
      approvalCount: result.approvedCount,
    });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') { res.status(404).json({ error: err.message }); return; }
    if (err.code === 'INVALID_STATUS') { res.status(400).json({ error: err.message }); return; }
    if (err.code === 'ALREADY_APPROVED') { res.status(409).json({ error: err.message }); return; }
    // Prisma unique constraint violation
    if (err.code === 'P2002') { res.status(409).json({ error: 'You have already approved this batch' }); return; }
    console.error('[Approval] Error:', err);
    res.status(500).json({ error: 'Failed to approve batch' });
  }
}

export async function rejectBatch(req: AuthRequest, res: Response): Promise<void> {
  const batchId = req.params['id'] as string;
  const { remarks } = req.body;
  if (!remarks) { res.status(400).json({ error: 'Rejection reason is required' }); return; }
  try {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }

    await prisma.$transaction([
      prisma.districtApproval.create({
        data: { batchId, officerId: req.user!.userId, decision: 'REJECTED', remarks },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { status: 'REJECTED', rejectedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: req.user!.userId,
      action: 'REJECT_BATCH',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: batch.status,
      newStatus: 'REJECTED',
      remarks,
    });
    res.json({ message: 'Batch rejected' });
  } catch {
    res.status(500).json({ error: 'Failed to reject batch' });
  }
}

export async function returnBatch(req: AuthRequest, res: Response): Promise<void> {
  const batchId = req.params['id'] as string;
  const { remarks } = req.body;
  if (!remarks) { res.status(400).json({ error: 'Return reason is required' }); return; }
  try {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }

    await prisma.$transaction([
      prisma.districtApproval.create({
        data: { batchId, officerId: req.user!.userId, decision: 'RETURNED', remarks },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { status: 'RETURNED', returnReason: remarks },
      }),
    ]);

    await createAuditLog({
      userId: req.user!.userId,
      action: 'RETURN_BATCH',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: batch.status,
      newStatus: 'RETURNED',
      remarks,
    });
    res.json({ message: 'Batch returned for correction' });
  } catch {
    res.status(500).json({ error: 'Failed to return batch' });
  }
}
