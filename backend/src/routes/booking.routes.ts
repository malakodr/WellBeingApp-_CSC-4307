import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  updateBooking,
  getCounselors,
} from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createBooking);
router.get('/my', authMiddleware, getMyBookings);
router.get('/counselors', authMiddleware, getCounselors);
router.patch('/:id', authMiddleware, updateBooking);

export default router;
