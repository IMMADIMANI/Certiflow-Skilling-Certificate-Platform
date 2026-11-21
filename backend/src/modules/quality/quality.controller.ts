import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';

export async function getQualityBatches(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: 'QUALITY_REVIEW' },
      include: {
        trainingCentre: { include: { district: true } },
        _count: { select: { candidates: true } },
        districtApprovals: { include: { officer: { select: { name: true } } } },
      },
      orderBy: { updatedAt: 'asc' },
    });
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch quality batches' });
  }
}

export async function submitQualityReview(req: AuthRequest, res: Response): Promise<void> {
  const batchId = req.params['id'] as string;
  const { decision, remarks } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    res.status(400).json({ error: 'Decision must be APPROVED or REJECTED' });
    return;
  }
  if (decision === 'REJECTED' && !remarks) {
    res.status(400).json({ error: 'Rejection remarks are required' });
    return;
  }

  try {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch || batch.status !== 'QUALITY_REVIEW') {
      res.status(400).json({ error: 'Batch is not in quality review' });
      return;
    }

    const newStatus = decision === 'APPROVED' ? 'STATE_REVIEW' : 'REJECTED';

    await prisma.$transaction([
      prisma.qualityReview.create({
        data: { batchId, reviewerId: req.user!.userId, decision, remarks: remarks || null },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { status: newStatus as any },
      }),
    ]);

    await createAuditLog({
      userId: req.user!.userId,
      action: 'QUALITY_REVIEW',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: 'QUALITY_REVIEW',
      newStatus,
      remarks,
    });

    res.json({ message: `Quality review submitted: ${decision}`, newStatus });
  } catch {
    res.status(500).json({ error: 'Failed to submit quality review' });
  }
}
