import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getCertificates, downloadCertificate } from './certificate.controller';

const router = Router();
router.get('/', authenticate, getCertificates);
router.get('/:id/download', authenticate, downloadCertificate);
export default router;
