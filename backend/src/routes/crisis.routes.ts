import { Router } from 'express';
import {
  createCrisisAlert,
  getCrisisAlerts,
  updateCrisisAlert,
} from '../controllers/crisis.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.post('/alert', authMiddleware, createCrisisAlert);
router.get('/alerts', authMiddleware, roleMiddleware(['counselor', 'admin']), getCrisisAlerts);
router.patch('/alerts/:id', authMiddleware, roleMiddleware(['counselor', 'admin']), updateCrisisAlert);

export default router;
