/**
 * Peer Room Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  listRooms,
  getRoomMetadata,
  getRoomMessages,
  createMessage,
} from '../controllers/peerRoom.controller';

const router = Router();

// Public routes (can view rooms without auth, but can't post)
router.get('/rooms', listRooms);

// Protected routes - require authentication
router.get('/rooms/:slug', authMiddleware, getRoomMetadata);
router.get('/rooms/:slug/messages', authMiddleware, getRoomMessages);
router.post('/rooms/:slug/messages', authMiddleware, createMessage);

export default router;
