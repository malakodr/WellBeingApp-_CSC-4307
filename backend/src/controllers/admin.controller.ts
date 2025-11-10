import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get counts
    const [
      totalUsers,
      studentCount,
      counselorCount,
      totalBookings,
      pendingBookings,
      totalTriages,
      highRiskTriages,
      crisisAlerts,
      activePeerRooms,
      totalMessages,
      flaggedMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'counselor' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.triageForm.count(),
      prisma.triageForm.count({ where: { riskFlag: true } }),
      prisma.crisisAlert.count(),
      prisma.peerRoom.count({ where: { isActive: true } }),
      prisma.message.count(),
      prisma.message.count({ where: { isFlagged: true } }),
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentTriages,
      recentBookings,
      recentCrisisAlerts,
    ] = await Promise.all([
      prisma.triageForm.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.crisisAlert.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    res.json({
      metrics: {
        users: {
          total: totalUsers,
          students: studentCount,
          counselors: counselorCount,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          recentWeek: recentBookings,
        },
        triages: {
          total: totalTriages,
          highRisk: highRiskTriages,
          recentWeek: recentTriages,
        },
        crisis: {
          total: crisisAlerts,
          recentWeek: recentCrisisAlerts,
        },
        peerRooms: {
          active: activePeerRooms,
          totalMessages,
          flaggedMessages,
        },
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
