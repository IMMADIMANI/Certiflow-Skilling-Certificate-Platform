import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { getQualityBatches, submitQualityReview } from './quality.controller';

const router = Router();
router.use(authenticate);
router.get('/', authorize('QUALITY_TEAM', 'STATE_OFFICE'), getQualityBatches);
router.post('/:id/review', authorize('QUALITY_TEAM'), submitQualityReview);
export default router;
