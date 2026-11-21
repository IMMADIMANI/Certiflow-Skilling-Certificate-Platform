import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  getStateBatches,
  getAllBatches,
  finalApprove,
  rejectBatchState,
  cancelCertificate,
  getDashboardStats,
} from './state.controller';

const router = Router();
router.use(authenticate, authorize('STATE_OFFICE'));
router.get('/batches', getStateBatches);
router.get('/all-batches', getAllBatches);
router.get('/stats', getDashboardStats);
router.post('/batches/:id/approve', finalApprove);
router.post('/batches/:id/reject', rejectBatchState);
router.post('/certificates/:certificateId/cancel', cancelCertificate);
export default router;
