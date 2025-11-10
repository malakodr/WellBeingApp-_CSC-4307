import { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const bookingSchema = z.object({
  counselorId: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  notes: z.string().optional(),
});

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
});

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = bookingSchema.parse(req.body);
    const startAt = new Date(validatedData.startAt);
    const endAt = new Date(validatedData.endAt);

    // Validate counselor exists and has counselor role
    const counselor = await prisma.user.findUnique({
      where: { id: validatedData.counselorId },
    });

    if (!counselor || counselor.role !== 'counselor') {
      res.status(400).json({ error: 'Invalid counselor' });
      return;
    }

    // Check if time slot is available (no overlapping bookings)
    const overlapping = await prisma.booking.findFirst({
      where: {
        counselorId: validatedData.counselorId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startAt: { lte: startAt } },
              { endAt: { gt: startAt } },
            ],
          },
          {
            AND: [
              { startAt: { lt: endAt } },
              { endAt: { gte: endAt } },
            ],
          },
          {
            AND: [
              { startAt: { gte: startAt } },
              { endAt: { lte: endAt } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      res.status(400).json({ error: 'Time slot not available' });
      return;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        studentId: req.user!.id,
        counselorId: validatedData.counselorId,
        startAt,
        endAt,
        notes: validatedData.notes,
      },
      include: {
        counselor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isStudent = req.user!.role === 'student';
    const isCounselor = req.user!.role === 'counselor';

    const where = isStudent
      ? { studentId: req.user!.id }
      : isCounselor
      ? { counselorId: req.user!.id }
      : { OR: [{ studentId: req.user!.id }, { counselorId: req.user!.id }] };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        counselor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { startAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateBookingSchema.parse(req.body);

    // Check if booking exists and user has permission
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const isStudent = req.user!.id === booking.studentId;
    const isCounselor = req.user!.id === booking.counselorId;
    const isAdmin = req.user!.role === 'admin';

    if (!isStudent && !isCounselor && !isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: validatedData,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        counselor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ booking: updatedBooking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCounselors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const counselors = await prisma.user.findMany({
      where: { role: 'counselor' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json({ counselors });
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
