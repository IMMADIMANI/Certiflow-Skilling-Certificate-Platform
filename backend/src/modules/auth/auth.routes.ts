import { Router } from 'express';
import { login, getProfile, getDemoAccounts } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.get('/demo-accounts', getDemoAccounts);
export default router;
