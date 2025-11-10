/**
 * Moderation Routes
 */

import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  moderateMessage,
  getFlaggedMessages,
} from '../controllers/moderation.controller';

const router = Router();

// All moderation routes require moderator or admin role
router.use(authMiddleware);
router.use(roleMiddleware(['moderator', 'admin']));

router.get('/mod/flagged', getFlaggedMessages);
router.post('/mod/rooms/:slug/flag', moderateMessage);

export default router;
