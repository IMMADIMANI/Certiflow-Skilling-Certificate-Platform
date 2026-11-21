import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { getAuditLogs } from './audit.controller';

const router = Router();
router.get('/', authenticate, authorize('STATE_OFFICE', 'DISTRICT_OFFICER'), getAuditLogs);
export default router;
