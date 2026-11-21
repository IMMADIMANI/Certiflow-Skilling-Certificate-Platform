import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { getDistrictBatches, approveBatch, rejectBatch, returnBatch } from './approval.controller';

const router = Router();
router.use(authenticate, authorize('DISTRICT_OFFICER'));
router.get('/', getDistrictBatches);
router.post('/:id/approve', approveBatch);
router.post('/:id/reject', rejectBatch);
router.post('/:id/return', returnBatch);
export default router;
