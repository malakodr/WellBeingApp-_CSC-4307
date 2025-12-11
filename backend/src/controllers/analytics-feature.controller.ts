import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

interface MetricData {
  date: string;
  count: number;
}

// Helper function to generate timeline data
function generateTimelineData(
  items: any[],
  days: number,
  dateField: string
): MetricData[] {
  const timeline: MetricData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const count = items.filter((item) => {
      const itemDate = new Date(item[dateField]).toISOString().split('T')[0];
      return itemDate === dateStr;
    }).length;

    timeline.push({ date: dateStr, count });
  }

  return timeline;
}

// Main analytics endpoint
export const getAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Fetch all data in parallel
    const [users, messages, sessions, triages] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, role: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.peerMessage.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.triageForm.findMany({
        where: { createdAt: { gte: startDate } },
        select: { urgency: true },
      }),
    ]);

    // Generate timeline data
    const userGrowth = generateTimelineData(users, daysNum, 'createdAt');
    const messageStats = generateTimelineData(messages, daysNum, 'createdAt');
    const sessionStats = generateTimelineData(sessions, daysNum, 'createdAt');

    // Risk level distribution
    const riskDistribution = [
      { name: 'Low', value: triages.filter((t) => t.urgency === 'low').length },
      { name: 'Medium', value: triages.filter((t) => t.urgency === 'medium').length },
      { name: 'High', value: triages.filter((t) => t.urgency === 'high').length },
      { name: 'Crisis', value: triages.filter((t) => t.urgency === 'crisis').length },
    ];

    // Calculate totals
    const totalUsers = await prisma.user.count();
    const totalMessages = await prisma.peerMessage.count();
    const totalSessions = await prisma.booking.count();
    
    // Active users (users with activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { updatedAt: { gte: sevenDaysAgo } },
          {
            sentMessages: {
              some: { createdAt: { gte: sevenDaysAgo } },
            },
          },
        ],
      },
    });

    res.json({
      userGrowth,
      messageStats,
      sessionStats,
      riskDistribution,
      totalUsers,
      totalMessages,
      totalSessions,
      activeUsers,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
};

// Get detailed report
export const getDetailedReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Detailed metrics
    const report = {
      users: await prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      bookings: await prisma.booking.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      messages: await prisma.peerMessage.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      averageResponseTime: '2.5 hours', // Placeholder - calculate from actual data
    };

    res.json(report);
  } catch (error: any) {
    console.error('Detailed report error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
};

// Export analytics data as CSV
export const exportAnalyticsData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const data = await prisma.booking.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        student: { select: { name: true, email: true } },
        counselor: { select: { name: true } },
      },
    });

    // Generate CSV
    const headers = ['Date', 'Student', 'Counselor', 'Status', 'Duration'];
    const rows = data.map((booking) => [
      booking.createdAt.toISOString().split('T')[0],
      booking.student.name,
      booking.counselor.name,
      booking.status,
      `${Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60000)} min`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message || 'Failed to export data' });
  }
};

// Get user growth metrics
export const getUserGrowthMetrics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const growth = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    res.json({ growth });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user growth' });
  }
};

// Get engagement metrics
export const getEngagementMetrics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const metrics = {
      dailyActiveUsers: await prisma.user.count({
        where: {
          sentMessages: {
            some: { createdAt: { gte: sevenDaysAgo } },
          },
        },
      }),
      averageSessionDuration: '45 minutes', // Calculate from actual session data
      messagesSent: await prisma.peerMessage.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    };

    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch engagement metrics' });
  }
};
