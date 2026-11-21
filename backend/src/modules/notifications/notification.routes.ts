import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { getNotifications } from './notification.controller';

const router = Router();
router.get('/', authenticate, authorize('STATE_OFFICE'), getNotifications);
export default router;
