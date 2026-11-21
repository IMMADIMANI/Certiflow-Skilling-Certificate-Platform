import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../config/database';

export async function getNotifications(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const notifs = await prisma.notification.findMany({
      include: {
        candidate: { select: { name: true, phone: true } },
        certificate: { select: { certificateNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(notifs);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}
