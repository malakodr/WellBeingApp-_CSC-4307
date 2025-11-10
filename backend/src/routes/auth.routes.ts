import { Router } from 'express';
import { register, login, getMe, consent } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/consent', authMiddleware, consent);

export default router;
