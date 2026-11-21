import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  createBatch,
  getBatches,
  getBatchById,
  uploadCandidates,
  submitBatch,
  getOverdueBatches,
} from './batch.controller';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(__dirname, '../../../uploads')),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.xlsx', '.csv', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .xlsx, .xls and .csv files are allowed'));
  },
});

const router = Router();
router.use(authenticate);
router.get('/overdue', authorize('STATE_OFFICE', 'DISTRICT_OFFICER'), getOverdueBatches);
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/', authorize('TRAINING_CENTRE'), createBatch);
router.post('/:id/upload', authorize('TRAINING_CENTRE'), upload.single('file'), uploadCandidates);
router.post('/:id/submit', authorize('TRAINING_CENTRE'), submitBatch);
export default router;
