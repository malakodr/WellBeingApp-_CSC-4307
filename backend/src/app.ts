import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error';

// Routes
import authRoutes from './routes/auth.routes';
import triageRoutes from './routes/triage.routes';
import bookingRoutes from './routes/booking.routes';
// import roomRoutes from './routes/room.routes'; // OLD - Replaced by peerRoom routes
import peerRoomRoutes from './routes/peerRoom.routes';
import crisisRoutes from './routes/crisis.routes';
import adminRoutes from './routes/admin.routes';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/triage', triageRoutes);
  app.use('/api/bookings', bookingRoutes);
  // app.use('/api/rooms', roomRoutes); // OLD - Replaced by peerRoom routes
  app.use('/api', peerRoomRoutes); // Peer room routes (already include /rooms prefix)
  app.use('/api/crisis', crisisRoutes);
  app.use('/api/admin', adminRoutes);

  // Error handler
  app.use(errorHandler);

  return app;
};
