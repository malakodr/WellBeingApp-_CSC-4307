import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  getCounselors,
} from '../controllers/booking.controller';

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

// Student routes
router.post('/', createBooking);           // Create new booking
router.get('/', getBookings);              // Get user's bookings
router.get('/counselors', getCounselors);  // Get available counselors
router.get('/:id', getBookingById);        // Get specific booking

// Update/Cancel routes
router.patch('/:id', updateBooking);       // Update booking status/notes
router.delete('/:id', updateBooking);      // Cancel booking (use updateBooking with status=CANCELLED)

export default router;
