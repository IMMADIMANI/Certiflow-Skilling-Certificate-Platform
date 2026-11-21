import prisma from '../../config/database';

interface AuditParams {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  batchId?: string;
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (error) {
    console.error('[AuditLog] Failed to write:', error);
  }
}
