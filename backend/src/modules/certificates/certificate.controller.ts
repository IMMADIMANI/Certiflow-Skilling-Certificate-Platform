import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../config/database';
import path from 'path';

export async function getCertificates(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const certs = await prisma.certificate.findMany({
      include: {
        candidate: { select: { name: true, phone: true, courseCompleted: true } },
        batch: { include: { trainingCentre: { select: { name: true } } } },
      },
      orderBy: { issuedAt: 'desc' },
    });
    res.json(certs);
  } catch {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

export async function downloadCertificate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cert = await prisma.certificate.findUnique({ where: { id: req.params['id'] as string } });
    if (!cert) { res.status(404).json({ error: 'Certificate not found' }); return; }
    if (cert.status === 'CANCELLED') {
      res.status(410).json({ error: 'This certificate has been cancelled' });
      return;
    }
    if (!cert.pdfPath) { res.status(404).json({ error: 'PDF not yet generated' }); return; }
    const filePath = path.join(process.cwd(), cert.pdfPath);
    res.download(filePath, `${cert.certificateNumber}.pdf`);
  } catch {
    res.status(500).json({ error: 'Failed to download certificate' });
  }
}
