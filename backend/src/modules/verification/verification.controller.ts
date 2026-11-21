import { Request, Response } from 'express';
import prisma from '../../config/database';

export async function verifyCertificate(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params['id'] as string;

    const cert = await prisma.certificate.findFirst({
      where: { OR: [{ id }, { certificateNumber: id }] },
      include: {
        candidate: {
          select: { name: true, courseCompleted: true, completionDate: true, grade: true, marks: true },
        },
        batch: { include: { trainingCentre: { select: { name: true } } } },
      },
    });

    if (!cert) {
      res.json({
        valid: false,
        status: 'NOT_FOUND',
        message: 'No certificate found with this ID. Please check and try again.',
      });
      return;
    }

    if (cert.status === 'CANCELLED') {
      res.json({
        valid: false,
        status: 'CANCELLED',
        message: 'This certificate has been cancelled and is no longer valid.',
        certificate: {
          certificateId: cert.certificateNumber,
          candidateName: cert.candidate.name,
          courseName: cert.candidate.courseCompleted,
          trainingCentreName: cert.batch.trainingCentre.name,
          completionDate: cert.candidate.completionDate,
          issuedAt: cert.issuedAt,
          cancelledAt: cert.cancelledAt,
          cancelReason: cert.cancelReason,
        },
      });
      return;
    }

    // Valid certificate — only expose safe fields
    res.json({
      valid: true,
      status: 'ACTIVE',
      message: 'Certificate is genuine and currently active.',
      certificate: {
        certificateId: cert.certificateNumber,
        candidateName: cert.candidate.name,
        courseName: cert.candidate.courseCompleted,
        trainingCentreName: cert.batch.trainingCentre.name,
        completionDate: cert.candidate.completionDate,
        issuedAt: cert.issuedAt,
        grade: cert.candidate.grade,
        marks: cert.candidate.marks,
      },
    });
  } catch (err) {
    console.error('[Verify] Error:', err);
    res.status(500).json({ error: 'Verification service temporarily unavailable' });
  }
}
