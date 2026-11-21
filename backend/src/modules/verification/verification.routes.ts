import { Router } from 'express';
import { verifyCertificate } from './verification.controller';

const router = Router();
// Public endpoint - no authentication required
router.get('/:id', verifyCertificate);
export default router;
