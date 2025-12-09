import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  updateBooking,
  getCounselors,
  getBookings,
  getBookingById,
} from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Create a new booking
router.post('/', authMiddleware, createBooking);

// Get all bookings with query filters (?counselorId=xxx&status=PENDING)
router.get('/', authMiddleware, getBookings);

// Get current user's bookings
router.get('/my', authMiddleware, getMyBookings);

// Get all counselors
router.get('/counselors', authMiddleware, getCounselors);

// Get specific booking by ID
router.get('/:id', authMiddleware, getBookingById);

// Update booking (status, notes)
router.patch('/:id', authMiddleware, updateBooking);

export default router;
