import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getCounselors,
} from '../controllers/booking.controller';

const router = Router();

// All booking routes require authentication
router.use(auth);

// Student routes
router.post('/', createBooking);           // Create new booking
router.get('/', getBookings);              // Get user's bookings
router.get('/counselors', getCounselors);  // Get available counselors
router.get('/:id', getBooking);            // Get specific booking

// Update/Cancel routes
router.patch('/:id', updateBooking);       // Update booking status/notes
router.delete('/:id', cancelBooking);      // Cancel booking

export default router;
