import { Router } from 'express';
import {
  getRooms,
  getRoom,
  sendMessage,
  getFlaggedMessages,
} from '../controllers/room.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getRooms); // Public - anyone can view room list
router.get('/:id', authMiddleware, getRoom);
router.post('/:id/message', authMiddleware, sendMessage);
router.get('/moderation/flagged', authMiddleware, roleMiddleware(['moderator', 'admin']), getFlaggedMessages);

export default router;
