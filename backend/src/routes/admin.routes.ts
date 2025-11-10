import { Router } from 'express';
import { getMetrics } from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.get('/metrics', authMiddleware, roleMiddleware(['admin']), getMetrics);

export default router;
