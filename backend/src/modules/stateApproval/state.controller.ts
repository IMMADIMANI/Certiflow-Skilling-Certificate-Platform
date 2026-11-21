import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';
import { generateCertificatesForBatch } from '../certificates/certificate.service';

export async function getStateBatches(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: 'STATE_REVIEW' },
      include: {
        trainingCentre: { include: { district: true } },
        _count: { select: { candidates: true } },
        districtApprovals: { include: { officer: { select: { name: true } } } },
      },
      orderBy: { updatedAt: 'asc' },
    });
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch batches for state review' });
  }
}

export async function getAllBatches(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        trainingCentre: { include: { district: true } },
        _count: { select: { candidates: true, certificates: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch all batches' });
  }
}

export async function finalApprove(req: AuthRequest, res: Response): Promise<void> {
  const batchId = req.params['id'] as string;
  const { remarks } = req.body;
  try {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
    if (batch.status !== 'STATE_REVIEW') {
      res.status(400).json({ error: 'Batch is not awaiting state approval' });
      return;
    }

    await prisma.$transaction([
      prisma.stateApproval.create({
        data: { batchId, officerId: req.user!.userId, decision: 'APPROVED', remarks: remarks || null },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { status: 'APPROVED', approvedAt: new Date() },
      }),
      prisma.candidate.updateMany({
        where: { batchId },
        data: { status: 'APPROVED' },
      }),
    ]);

    await createAuditLog({
      userId: req.user!.userId,
      action: 'STATE_APPROVE',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: 'STATE_REVIEW',
      newStatus: 'APPROVED',
      remarks,
    });

    // Generate certificates asynchronously (non-blocking)
    generateCertificatesForBatch(batchId).catch(console.error);

    res.json({ message: 'Batch approved by state office. Certificate generation started in background.' });
  } catch (err) {
    console.error('[State] Approve error:', err);
    res.status(500).json({ error: 'Failed to approve batch' });
  }
}

export async function rejectBatchState(req: AuthRequest, res: Response): Promise<void> {
  const batchId = req.params['id'] as string;
  const { remarks } = req.body;
  if (!remarks) { res.status(400).json({ error: 'Rejection reason is required' }); return; }
  try {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }

    await prisma.$transaction([
      prisma.stateApproval.create({
        data: { batchId, officerId: req.user!.userId, decision: 'REJECTED', remarks },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { status: 'REJECTED', rejectedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: req.user!.userId,
      action: 'STATE_REJECT',
      entityType: 'BATCH',
      entityId: batchId,
      batchId,
      previousStatus: 'STATE_REVIEW',
      newStatus: 'REJECTED',
      remarks,
    });
    res.json({ message: 'Batch rejected by state office' });
  } catch {
    res.status(500).json({ error: 'Failed to reject batch' });
  }
}

export async function cancelCertificate(req: AuthRequest, res: Response): Promise<void> {
  const certificateId = req.params['certificateId'] as string;
  const { reason } = req.body;
  if (!reason) { res.status(400).json({ error: 'Cancellation reason is required' }); return; }
  try {
    const cert = await prisma.certificate.findUnique({ where: { id: certificateId } });
    if (!cert) { res.status(404).json({ error: 'Certificate not found' }); return; }
    if (cert.status === 'CANCELLED') {
      res.status(400).json({ error: 'Certificate is already cancelled' });
      return;
    }

    await prisma.$transaction([
      prisma.certificate.update({
        where: { id: certificateId },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
      }),
      prisma.candidate.update({
        where: { id: cert.candidateId },
        data: { status: 'CANCELLED' },
      }),
    ]);

    await createAuditLog({
      userId: req.user!.userId,
      action: 'CANCEL_CERTIFICATE',
      entityType: 'CERTIFICATE',
      entityId: certificateId,
      batchId: cert.batchId,
      previousStatus: 'ACTIVE',
      newStatus: 'CANCELLED',
      remarks: reason,
    });

    res.json({ message: 'Certificate cancelled successfully. It will now show as cancelled on public verification.' });
  } catch {
    res.status(500).json({ error: 'Failed to cancel certificate' });
  }
}

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [totalBatches, pendingBatches, approvedBatches, totalCerts, activeCerts, overdueBatches] =
      await Promise.all([
        prisma.batch.count(),
        prisma.batch.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'QUALITY_REVIEW', 'STATE_REVIEW'] } } }),
        prisma.batch.count({ where: { status: 'APPROVED' } }),
        prisma.certificate.count(),
        prisma.certificate.count({ where: { status: 'ACTIVE' } }),
        prisma.batch.count({
          where: {
            status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
            submittedAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
          },
        }),
      ]);

    res.json({ totalBatches, pendingBatches, approvedBatches, totalCerts, activeCerts, overdueBatches });
  } catch {
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
}
