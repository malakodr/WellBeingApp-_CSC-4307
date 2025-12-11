    # Reports and Analytics System - Complete Code Reference

    ## Table of Contents
    1. [Database Schema](#database-schema)
    2. [Reports Controller](#reports-controller)
    3. [Analytics Controller](#analytics-controller)
    4. [Admin Routes](#admin-routes)
    5. [Frontend Admin Reports](#frontend-admin-reports)
    6. [Crisis Management](#crisis-management)
    7. [Triage System](#triage-system)
    8. [Moderation System](#moderation-system)
    9. [Booking System](#booking-system)
    10. [API Integration](#api-integration)

    ---

    ## Database Schema

    ### Core Models (schema.prisma)

    ```prisma
    // User Model - Multi-role system
    model User {
    id             String   @id @default(cuid())
    email          String   @unique
    password       String
    name           String?
    displayName    String?
    role           String   // 'student', 'counselor', 'moderator', 'admin'
    ageBracket     String?  // 'UNDER18' or 'ADULT'
    consentMinorOk Boolean  @default(false)
    
    // OAuth fields
    oauthProvider    String?
    oauthProviderId  String?
    profilePicture   String?
    
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt

    // Relations
    triageForms              TriageForm[]
    bookingsAsStudent        Booking[]        @relation("StudentBookings")
    bookingsAsCounselor      Booking[]        @relation("CounselorBookings")
    crisisAlerts             CrisisAlert[]
    auditLogs                AuditLog[]
    peerMessages             PeerMessage[]
    supportRoomsAsStudent    SupportRoom[]    @relation("SupportRoomStudent")
    supportRoomsAsSupporter  SupportRoom[]    @relation("SupportRoomSupporter")
    supportMessages          SupportMessage[]
    activityLogs             ActivityLog[]    @relation("UserActivityLogs")
    }

    // Triage Form - Initial assessment
    model TriageForm {
    id        String   @id @default(cuid())
    userId    String
    topic     String
    moodScore Int      // 1-10 scale
    urgency   String   // 'low', 'medium', 'high', 'crisis'
    message   String?
    riskFlag  Boolean  @default(false)
    route     String?  // 'CRISIS', 'BOOK', 'PEER'
    createdAt DateTime @default(now())

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId])
    @@index([riskFlag])
    }

    // Booking - Counselor appointments
    model Booking {
    id          String   @id @default(cuid())
    studentId   String
    counselorId String
    startAt     DateTime
    endAt       DateTime
    status      String   @default("PENDING") // 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    notes       String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    student   User @relation("StudentBookings", fields: [studentId], references: [id], onDelete: Cascade)
    counselor User @relation("CounselorBookings", fields: [counselorId], references: [id], onDelete: Cascade)

    @@index([studentId])
    @@index([counselorId])
    @@index([startAt])
    }

    // Crisis Alert - Emergency system
    model CrisisAlert {
    id        String   @id @default(cuid())
    userId    String?
    message   String
    source    String   @default("general") // 'chat', 'triage', 'general'
    roomSlug  String?
    status    String   @default("PENDING") // 'PENDING', 'ACKNOWLEDGED', 'RESOLVED'
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

    @@index([userId])
    @@index([status])
    }

    // Support Room - Private 1-on-1 support
    model SupportRoom {
    id          String   @id @default(cuid())
    studentId   String
    supporterId String?
    topic       String
    urgency     String
    status      String   @default("WAITING") // 'WAITING', 'ACTIVE', 'RESOLVED', 'CLOSED'
    routedTo    String   // 'counselor', 'peer_supporter'
    isPrivate   Boolean  @default(true)
    initialMessage String?
    lastMessageAt DateTime?
    lastMessagePreview String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    claimedAt   DateTime?
    closedAt    DateTime?
    
    student    User             @relation("SupportRoomStudent", fields: [studentId], references: [id], onDelete: Cascade)
    supporter  User?            @relation("SupportRoomSupporter", fields: [supporterId], references: [id], onDelete: SetNull)
    messages   SupportMessage[]
    
    @@index([studentId])
    @@index([supporterId])
    @@index([status])
    @@index([topic])
    }

    // Activity Log - Audit trail
    model ActivityLog {
    id          String   @id @default(cuid())
    userId      String?
    user        User?    @relation("UserActivityLogs", fields: [userId], references: [id], onDelete: SetNull)
    action      String
    entity      String?
    entityId    String?
    ipAddress   String?
    userAgent   String?
    metadata    String?
    createdAt   DateTime @default(now())
    
    @@index([userId])
    @@index([action])
    @@index([entity])
    @@index([createdAt])
    }
    ```

    ---

    ## Reports Controller

    ### Complete Implementation (reports.controller.ts)

    ```typescript
    import { Response } from 'express';
    import prisma from '../lib/prisma';
    import { AuthRequest } from '../middleware/auth';

    export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type = 'weekly', startDate, endDate } = req.query;

        let start: Date;
        let end: Date = new Date();

        // Date range calculation
        if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
        } else if (type === 'weekly') {
        start = new Date();
        start.setDate(start.getDate() - 7);
        } else if (type === 'monthly') {
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        } else {
        start = new Date();
        start.setDate(start.getDate() - 7);
        }

        // Parallel data aggregation for performance
        const [
        totalUsers,
        newUsers,
        activeUsers,
        totalSessions,
        completedSessions,
        cancelledSessions,
        triageSubmissions,
        highRiskTriages,
        crisisAlerts,
        resolvedCrisis,
        peerMessages,
        flaggedMessages,
        peerRooms,
        supportRooms,
        resolvedSupport,
        ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.user.count({
            where: {
            OR: [
                { triageForms: { some: { createdAt: { gte: start, lte: end } } } },
                { bookingsAsStudent: { some: { createdAt: { gte: start, lte: end } } } },
                { peerMessages: { some: { createdAt: { gte: start, lte: end } } } },
            ],
            },
        }),
        prisma.booking.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.booking.count({ 
            where: { 
            createdAt: { gte: start, lte: end },
            status: 'COMPLETED' 
            } 
        }),
        prisma.booking.count({ 
            where: { 
            createdAt: { gte: start, lte: end },
            status: 'CANCELLED' 
            } 
        }),
        prisma.triageForm.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.triageForm.count({ 
            where: { 
            createdAt: { gte: start, lte: end },
            riskFlag: true 
            } 
        }),
        prisma.crisisAlert.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.crisisAlert.count({ 
            where: { 
            createdAt: { gte: start, lte: end },
            status: 'RESOLVED' 
            } 
        }),
        prisma.peerMessage.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.peerMessage.count({ 
            where: { 
            createdAt: { gte: start, lte: end },
            flagged: true 
            } 
        }),
        prisma.peerRoom.count(),
        prisma.supportRoom.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.supportRoom.count({ 
            where: { 
            createdAt: { gte: start, lte: end },
            status: 'RESOLVED' 
            } 
        }),
        ]);

        // Support types distribution
        const triagesByTopic = await prisma.triageForm.groupBy({
        by: ['topic'],
        _count: { topic: true },
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { _count: { topic: 'desc' } },
        });

        const supportTypesDistribution = triagesByTopic.map(t => ({
        category: t.topic,
        count: t._count.topic,
        percentage: totalSessions > 0 ? ((t._count.topic / totalSessions) * 100).toFixed(1) : '0',
        }));

        // Average session duration calculation
        const completedBookingsWithDuration = await prisma.booking.findMany({
        where: {
            createdAt: { gte: start, lte: end },
            status: 'COMPLETED',
        },
        select: {
            startAt: true,
            endAt: true,
        },
        });

        const totalDuration = completedBookingsWithDuration.reduce((sum, booking) => {
        const duration = new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime();
        return sum + duration;
        }, 0);

        const avgSessionDuration = completedBookingsWithDuration.length > 0
        ? Math.round(totalDuration / completedBookingsWithDuration.length / (1000 * 60)) // minutes
        : 0;

        // Top counselors/supporters ranking
        const topCounselors = await prisma.user.findMany({
        where: {
            role: { in: ['counselor', 'moderator'] },
            bookingsAsCounselor: {
            some: {
                createdAt: { gte: start, lte: end },
                status: 'COMPLETED',
            },
            },
        },
        select: {
            id: true,
            displayName: true,
            name: true,
            role: true,
            _count: {
            select: {
                bookingsAsCounselor: {
                where: {
                    createdAt: { gte: start, lte: end },
                    status: 'COMPLETED',
                },
                },
            },
            },
        },
        orderBy: {
            bookingsAsCounselor: {
            _count: 'desc',
            },
        },
        take: 10,
        });

        // Build comprehensive engagement report
        const engagementReport = {
        period: {
            start: start.toISOString(),
            end: end.toISOString(),
            type: type as string,
        },
        users: {
            total: totalUsers,
            new: newUsers,
            active: activeUsers,
            engagementRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0',
        },
        sessions: {
            total: totalSessions,
            completed: completedSessions,
            cancelled: cancelledSessions,
            completionRate: totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : '0',
            avgDuration: `${avgSessionDuration} min`,
        },
        triage: {
            total: triageSubmissions,
            highRisk: highRiskTriages,
            riskRate: triageSubmissions > 0 ? ((highRiskTriages / triageSubmissions) * 100).toFixed(1) : '0',
        },
        crisis: {
            total: crisisAlerts,
            resolved: resolvedCrisis,
            resolutionRate: crisisAlerts > 0 ? ((resolvedCrisis / crisisAlerts) * 100).toFixed(1) : '0',
        },
        messaging: {
            totalMessages: peerMessages,
            flaggedMessages,
            flagRate: peerMessages > 0 ? ((flaggedMessages / peerMessages) * 100).toFixed(1) : '0',
        },
        support: {
            peerRooms,
            supportRooms,
            resolved: resolvedSupport,
            resolutionRate: supportRooms > 0 ? ((resolvedSupport / supportRooms) * 100).toFixed(1) : '0',
        },
        supportTypesDistribution,
        topCounselors: topCounselors.map(c => ({
            id: c.id,
            name: c.displayName || c.name,
            role: c.role,
            completedSessions: c._count.bookingsAsCounselor,
        })),
        };

        res.json({ report: engagementReport });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };

    export const exportReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { format = 'json' } = req.query;

        // Generate report data
        await getReports(req, res);
        
        // Future: implement CSV/PDF export
        if (format === 'csv') {
        res.status(501).json({ error: 'CSV export not yet implemented' });
        return;
        }

        if (format === 'pdf') {
        res.status(501).json({ error: 'PDF export not yet implemented' });
        return;
        }
    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };
    ```

    ---

    ## Analytics Controller

    ### Advanced Analytics (analytics.controller.ts)

    ```typescript
    import { Response } from 'express';
    import prisma from '../lib/prisma';
    import { AuthRequest } from '../middleware/auth';

    export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { days = 30 } = req.query;
        const daysNum = parseInt(days as string, 10) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysNum);

        // User Growth Timeline
        const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, role: true },
        orderBy: { createdAt: 'asc' },
        });

        const userGrowthTimeline = generateTimelineData(users, daysNum, 'createdAt');

        // Daily Messages
        const messages = await prisma.peerMessage.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
        });

        const dailyMessages = generateTimelineData(messages, daysNum, 'createdAt');

        // Daily Sessions
        const sessions = await prisma.booking.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
        });

        const dailySessions = generateTimelineData(sessions, daysNum, 'createdAt');

        // Risk Level Distribution
        const triages = await prisma.triageForm.findMany({
        where: { createdAt: { gte: startDate } },
        select: { urgency: true },
        });

        const riskLevelDistribution = {
        low: triages.filter(t => t.urgency === 'low').length,
        medium: triages.filter(t => t.urgency === 'medium').length,
        high: triages.filter(t => t.urgency === 'high').length,
        crisis: triages.filter(t => t.urgency === 'crisis').length,
        };

        // Support Category Breakdown
        const triageTopics = await prisma.triageForm.findMany({
        where: { createdAt: { gte: startDate } },
        select: { topic: true },
        });

        const supportCategoryBreakdown = triageTopics.reduce((acc: any, t) => {
        acc[t.topic] = (acc[t.topic] || 0) + 1;
        return acc;
        }, {});

        // Peak Hours Analysis
        const allMessages = await prisma.peerMessage.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        });

        const peakHours = Array(24).fill(0);
        allMessages.forEach(msg => {
        const hour = new Date(msg.createdAt).getHours();
        peakHours[hour]++;
        });

        // Peer Tutor Performance Metrics
        const moderators = await prisma.user.findMany({
        where: { role: 'moderator' },
        select: {
            id: true,
            displayName: true,
            name: true,
            supportRoomsAsSupporter: {
            where: { 
                status: 'RESOLVED',
                createdAt: { gte: startDate }
            },
            select: {
                id: true,
                createdAt: true,
                closedAt: true,
            },
            },
            peerMessages: {
            where: { createdAt: { gte: startDate } },
            select: { id: true },
            },
        },
        });

        const peerTutorPerformanceMetrics = moderators.map(mod => {
        const resolvedRooms = mod.supportRoomsAsSupporter.length;
        const totalMessages = mod.peerMessages.length;
        const avgResponseTime = mod.supportRoomsAsSupporter.length > 0
            ? mod.supportRoomsAsSupporter.reduce((sum, room) => {
                if (room.closedAt) {
                const duration = new Date(room.closedAt).getTime() - new Date(room.createdAt).getTime();
                return sum + duration;
                }
                return sum;
            }, 0) / mod.supportRoomsAsSupporter.length / (1000 * 60)
            : 0;

        return {
            id: mod.id,
            name: mod.displayName || mod.name || 'Unknown',
            resolvedSessions: resolvedRooms,
            totalMessages,
            avgResponseTime: Math.round(avgResponseTime),
        };
        }).sort((a, b) => b.resolvedSessions - a.resolvedSessions).slice(0, 10);

        // Retention Rate Calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const oldUsers = await prisma.user.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        });

        const returningUsers = await prisma.user.count({
        where: {
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            OR: [
            { triageForms: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { bookingsAsStudent: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { peerMessages: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            ],
        },
        });

        const retentionRate = oldUsers > 0 ? ((returningUsers / oldUsers) * 100).toFixed(1) : '0';

        // Repeat Support Usage
        const usersWithMultipleSessions = await prisma.user.findMany({
        where: {
            bookingsAsStudent: {
            some: { createdAt: { gte: startDate } },
            },
        },
        select: {
            bookingsAsStudent: {
            where: { createdAt: { gte: startDate } },
            select: { id: true },
            },
        },
        });

        const repeatSupportUsage = usersWithMultipleSessions.filter(
        u => u.bookingsAsStudent.length > 1
        ).length;

        res.json({
        analytics: {
            userGrowthTimeline,
            dailyMessages,
            dailySessions,
            dailyNewUsers: userGrowthTimeline,
            peerTutorPerformanceMetrics,
            riskLevelDistribution,
            supportCategoryBreakdown,
            peakHours: peakHours.map((count, hour) => ({ hour, count })),
            retentionRate: `${retentionRate}%`,
            repeatSupportUsage,
            timeRange: {
            days: daysNum,
            start: startDate.toISOString(),
            end: new Date().toISOString(),
            },
        },
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };

    // Helper function for timeline generation
    function generateTimelineData(items: any[], days: number, dateField: string) {
    const timeline: any[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const count = items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= date && itemDate < nextDate;
        }).length;
        
        timeline.push({
        date: date.toISOString().split('T')[0],
        count,
        });
    }
    
    return timeline;
    }
    ```

    ---

    ## Admin Routes

    ### API Route Configuration (admin.routes.ts)

    ```typescript
    import { Router } from 'express';
    import { getMetrics } from '../controllers/admin.controller';
    import { getAnalytics } from '../controllers/analytics.controller';
    import { getAllUsers, getUserById, createUser, updateUser, deleteUser, resetUserPassword } from '../controllers/users.controller';
    import { getActivityLogs, getActivitySummary } from '../controllers/activityLog.controller';
    import { getSystemAlerts, markAlertAsRead, createSystemAlert, deleteSystemAlert } from '../controllers/alerts.controller';
    import { getReports, exportReport } from '../controllers/reports.controller';
    import { getSettings, updateSetting, batchUpdateSettings } from '../controllers/settings.controller';
    import { authMiddleware, roleMiddleware } from '../middleware/auth';

    const router = Router();

    // All admin routes require authentication + admin role
    router.use(authMiddleware, roleMiddleware(['admin']));

    // Metrics & Analytics
    router.get('/metrics', getMetrics);
    router.get('/analytics', getAnalytics);

    // User Management
    router.get('/users', getAllUsers);
    router.get('/users/:id', getUserById);
    router.post('/users', createUser);
    router.patch('/users/:id', updateUser);
    router.delete('/users/:id', deleteUser);
    router.post('/users/:id/reset-password', resetUserPassword);

    // Activity Logs
    router.get('/activity-logs', getActivityLogs);
    router.get('/activity-logs/summary', getActivitySummary);

    // System Alerts
    router.get('/alerts', getSystemAlerts);
    router.patch('/alerts/:id/read', markAlertAsRead);
    router.post('/alerts', createSystemAlert);
    router.delete('/alerts/:id', deleteSystemAlert);

    // Reports (Main Feature)
    router.get('/reports', getReports);
    router.get('/reports/export', exportReport);

    // Settings
    router.get('/settings', getSettings);
    router.patch('/settings', updateSetting);
    router.post('/settings/batch', batchUpdateSettings);

    export default router;
    ```

    ---

    ## Frontend Admin Reports

    ### React Component (AdminReports.tsx)

    ```typescript
    import { useState, useEffect } from 'react';
    import { FileText, Download, Calendar, TrendingUp, Users, Activity, Loader2 } from 'lucide-react';
    import { api } from '../../lib/api';

    export function AdminReports() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');

    useEffect(() => {
        loadReport();
    }, [reportType]);

    const loadReport = async () => {
        try {
        setLoading(true);
        const { report: data } = await api.getReports({ type: reportType });
        setReport(data);
        } catch (error) {
        console.error('Failed to load report:', error);
        } finally {
        setLoading(false);
        }
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        );
    }

    if (!report) {
        return <div className="text-center py-12"><p className="text-gray-600">Failed to load report</p></div>;
    }

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Platform Reports
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive engagement reports</p>
            </div>
            <div className="flex gap-2">
            <button
                onClick={() => setReportType('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'weekly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                Weekly
            </button>
            <button
                onClick={() => setReportType('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                Monthly
            </button>
            <button
                onClick={() => alert('Export feature coming soon')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                <Download className="w-4 h-4" />
                Export PDF
            </button>
            </div>
        </div>

        {/* Report Period */}
        <div className="bg-linear-to-r from-primary to-[#00875c] rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">Report Period</h2>
            </div>
            <p className="text-white/90">
            {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
            </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="User Engagement"
            value={`${report.users.engagementRate}%`}
            subtitle={`${report.users.active} active users`}
            bg="bg-blue-50"
            />
            <MetricCard
            icon={<Activity className="w-6 h-6 text-green-600" />}
            title="Session Completion"
            value={`${report.sessions.completionRate}%`}
            subtitle={`${report.sessions.completed} completed`}
            bg="bg-green-50"
            />
            <MetricCard
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            title="Crisis Resolution"
            value={`${report.crisis.resolutionRate}%`}
            subtitle={`${report.crisis.resolved} resolved`}
            bg="bg-purple-50"
            />
            <MetricCard
            icon={<FileText className="w-6 h-6 text-orange-600" />}
            title="Support Resolution"
            value={`${report.support.resolutionRate}%`}
            subtitle={`${report.support.resolved} resolved`}
            bg="bg-orange-50"
            />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users */}
            <ReportSection title="User Statistics">
            <ReportRow label="Total Users" value={report.users.total} />
            <ReportRow label="New Users" value={report.users.new} />
            <ReportRow label="Active Users" value={report.users.active} />
            <ReportRow label="Engagement Rate" value={`${report.users.engagementRate}%`} />
            </ReportSection>

            {/* Sessions */}
            <ReportSection title="Session Statistics">
            <ReportRow label="Total Sessions" value={report.sessions.total} />
            <ReportRow label="Completed" value={report.sessions.completed} />
            <ReportRow label="Cancelled" value={report.sessions.cancelled} />
            <ReportRow label="Avg Duration" value={report.sessions.avgDuration} />
            </ReportSection>

            {/* Triage */}
            <ReportSection title="Triage Statistics">
            <ReportRow label="Total Submissions" value={report.triage.total} />
            <ReportRow label="High Risk" value={report.triage.highRisk} />
            <ReportRow label="Risk Rate" value={`${report.triage.riskRate}%`} />
            </ReportSection>

            {/* Messaging */}
            <ReportSection title="Messaging Statistics">
            <ReportRow label="Total Messages" value={report.messaging.totalMessages} />
            <ReportRow label="Flagged Messages" value={report.messaging.flaggedMessages} />
            <ReportRow label="Flag Rate" value={`${report.messaging.flagRate}%`} />
            </ReportSection>
        </div>

        {/* Support Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Category Breakdown</h3>
            <div className="space-y-3">
            {report.supportTypesDistribution.map((category: any) => (
                <div key={category.category} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{category.category}</span>
                <div className="flex items-center gap-3">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                    />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {category.count} ({category.percentage}%)
                    </span>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Top Counselors */}
        {report.topCounselors?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
                {report.topCounselors.map((counselor: any, index: number) => (
                <div key={counselor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{counselor.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{counselor.role}</p>
                    </div>
                    </div>
                    <div className="text-right">
                    <p className="font-semibold text-gray-900">{counselor.completedSessions} sessions</p>
                    <p className="text-sm text-gray-600">Completed</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}
        </div>
    );
    }

    // Helper Components
    function MetricCard({ icon, title, value, subtitle, bg }: any) {
    return (
        <div className={`${bg} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-3">
            {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
    );
    }

    function ReportSection({ title, children }: any) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">{children}</div>
        </div>
    );
    }

    function ReportRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
        </div>
    );
    }
    ```

    ---

    ## Crisis Management

    ### Crisis Controller (crisis.controller.ts)

    ```typescript
    import { Response } from 'express';
    import { z } from 'zod';
    import prisma from '../lib/prisma';
    import { AuthRequest } from '../middleware/auth';
    import { getIO } from '../sockets';

    const crisisAlertSchema = z.object({
    message: z.string().min(1),
    });

    export const createCrisisAlert = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const validatedData = crisisAlertSchema.parse(req.body);

        // Create crisis alert
        const alert = await prisma.crisisAlert.create({
        data: {
            userId: req.user!.id,
            message: validatedData.message,
        },
        include: {
            user: {
            select: { 
                id: true, 
                name: true, 
                displayName: true,
                email: true,
                ageBracket: true,
            },
            },
        },
        });

        // Emit real-time notification to counselors
        const io = getIO();
        if (io && alert.user) {
        io.to('counselors').emit('crisis:alert', {
            id: alert.id,
            userId: alert.userId,
            userName: alert.user.displayName || alert.user.name || 'Student',
            userEmail: alert.user.email,
            ageBracket: alert.user.ageBracket,
            message: alert.message,
            status: alert.status,
            createdAt: alert.createdAt,
        });
        console.log('🚨 CRISIS ALERT emitted to counselors via Socket.IO');
        }
        
        // Log alert
        console.log('🚨 CRISIS ALERT:', {
        id: alert.id,
        user: alert.user?.displayName || alert.user?.name || 'Unknown',
        message: alert.message
        });

        res.status(201).json({
        alert: {
            id: alert.id,
            message: 'Crisis alert received. Help is on the way.',
            status: alert.status,
        },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
        }
        console.error('Create crisis alert error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };

    export const getCrisisAlerts = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const alerts = await prisma.crisisAlert.findMany({
        where: {
            status: { in: ['PENDING', 'ACKNOWLEDGED'] },
        },
        include: {
            user: {
            select: { id: true, name: true, email: true, ageBracket: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        });

        res.json({ alerts });
    } catch (error) {
        console.error('Get crisis alerts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };

    export const updateCrisisAlert = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
        }

        const alert = await prisma.crisisAlert.update({
        where: { id },
        data: { status },
        });

        res.json({ alert });
    } catch (error) {
        console.error('Update crisis alert error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };
    ```

    ---

    ## Triage System

    ### Triage Controller (triage.controller.ts)

    ```typescript
    import { Response } from 'express';
    import { z } from 'zod';
    import prisma from '../lib/prisma';
    import { AuthRequest } from '../middleware/auth';
    import { detectRisk } from '../lib/riskDetection';

    const triageSchema = z.object({
    topic: z.string().min(1),
    moodScore: z.number().min(1).max(10),
    urgency: z.enum(['low', 'medium', 'high', 'crisis']),
    message: z.string().optional(),
    });

    export const createTriage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const validatedData = triageSchema.parse(req.body);

        // Risk Detection Algorithm
        const riskFlag = validatedData.message
        ? detectRisk(validatedData.message)
        : false;
        
        const lowMoodRisk = validatedData.moodScore < 3;
        const isHighRisk = riskFlag || lowMoodRisk || validatedData.urgency === 'crisis';

        // Intelligent Routing Logic
        let route: 'CRISIS' | 'BOOK' | 'PEER';
        let urgencyLevel: 'low' | 'medium' | 'high' | 'crisis';
        
        if (isHighRisk) {
        route = 'CRISIS';
        urgencyLevel = 'crisis';
        } else if (validatedData.urgency === 'high') {
        route = 'BOOK';
        urgencyLevel = 'high';
        } else if (validatedData.urgency === 'medium') {
        route = 'PEER';
        urgencyLevel = 'medium';
        } else {
        route = 'PEER';
        urgencyLevel = 'low';
        }

        // Save triage form
        const triageForm = await prisma.triageForm.create({
        data: {
            userId: req.user!.sub,
            topic: validatedData.topic,
            moodScore: validatedData.moodScore,
            urgency: urgencyLevel,
            message: validatedData.message,
            riskFlag: isHighRisk,
            route,
        },
        });

        // Auto-create crisis alert for high-risk cases
        if (isHighRisk) {
        await prisma.crisisAlert.create({
            data: {
            userId: req.user!.sub,
            message: validatedData.message || `High-risk triage detected: ${validatedData.topic}`,
            },
        });
        }

        // Create private support room
        let supportRoom = null;
        if (route === 'PEER' || route === 'BOOK') {
        const routedTo = route === 'BOOK' || urgencyLevel === 'high' || ['anxiety', 'health', 'family'].includes(validatedData.topic.toLowerCase())
            ? 'counselor'
            : 'peer_supporter';

        supportRoom = await prisma.supportRoom.create({
            data: {
            studentId: req.user!.sub,
            topic: validatedData.topic.toLowerCase(),
            urgency: urgencyLevel,
            routedTo,
            initialMessage: validatedData.message,
            status: 'WAITING',
            },
        });

        // Create initial message
        if (validatedData.message) {
            await prisma.supportMessage.create({
            data: {
                roomId: supportRoom.id,
                senderId: req.user!.sub,
                content: validatedData.message,
            },
            });
        }

        console.log(`✅ Support room created: ${supportRoom.id} for triage ${triageForm.id}`);
        }

        res.status(201).json({
        triage: triageForm,
        route,
        supportRoom: supportRoom ? { id: supportRoom.id } : null,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
        }
        console.error('Create triage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    };
    ```

    ---

    ## Moderation System

    ### Moderation Controller (moderation.controller.ts)

    ```typescript
    import { Response } from 'express';
    import prisma from '../lib/prisma';
    import { AuthRequest } from '../middleware/auth';

    export async function moderateMessage(req: AuthRequest, res: Response) {
    try {
        const { slug } = req.params;
        const { messageId, action } = req.body;
        const moderator = req.user!;

        // Validate input
        if (!messageId || !action) {
        return res.status(400).json({ error: 'messageId and action are required' });
        }

        if (!['approve', 'remove', 'muteUser'].includes(action)) {
        return res.status(400).json({ 
            error: 'Invalid action. Must be: approve, remove, or muteUser' 
        });
        }

        // Verify room exists
        const room = await prisma.peerRoom.findUnique({
        where: { slug },
        select: { id: true, title: true },
        });

        if (!room) {
        return res.status(404).json({ error: 'Room not found' });
        }

        // Get the message
        const message = await prisma.peerMessage.findUnique({
        where: { id: messageId },
        include: {
            author: {
            select: {
                id: true,
                email: true,
                displayName: true,
            },
            },
        },
        });

        if (!message) {
        return res.status(404).json({ error: 'Message not found' });
        }

        if (message.roomId !== room.id) {
        return res.status(400).json({ error: 'Message does not belong to this room' });
        }

        let result;

        switch (action) {
        case 'approve':
            // Unflag the message
            result = await prisma.peerMessage.update({
            where: { id: messageId },
            data: {
                flagged: false,
                flags: JSON.stringify([]),
            },
            });

            await prisma.auditLog.create({
            data: {
                actorId: moderator.id!,
                action: 'MESSAGE_APPROVED',
                eventType: 'MESSAGE_FLAGGED',
                roomId: room.id,
                metadata: JSON.stringify({
                messageId,
                roomSlug: slug,
                roomTitle: room.title,
                authorId: message.authorId,
                preview: message.body.substring(0, 100),
                }),
            },
            });

            return res.json({ message: 'Message approved', data: result });

        case 'remove':
            // Delete the message
            await prisma.peerMessage.delete({
            where: { id: messageId },
            });

            await prisma.auditLog.create({
            data: {
                actorId: moderator.id!,
                action: 'MESSAGE_REMOVED',
                eventType: 'MESSAGE_FLAGGED',
                roomId: room.id,
                metadata: JSON.stringify({
                messageId,
                roomSlug: slug,
                roomTitle: room.title,
                authorId: message.authorId,
                preview: message.body.substring(0, 100),
                }),
            },
            });

            return res.json({ message: 'Message removed' });

        case 'muteUser':
            // Log muting action
            await prisma.auditLog.create({
            data: {
                actorId: moderator.id!,
                action: 'USER_MUTED',
                eventType: 'MESSAGE_FLAGGED',
                roomId: room.id,
                metadata: JSON.stringify({
                userId: message.authorId,
                userEmail: message.author?.email,
                roomSlug: slug,
                roomTitle: room.title,
                messageId,
                preview: message.body.substring(0, 100),
                }),
            },
            });

            console.warn(`⚠️  User ${message.author?.email} muted by ${moderator.id}`);

            return res.json({ 
            message: 'User muted (logged for review)' 
            });

        default:
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error in moderateMessage:', error);
        return res.status(500).json({ error: 'Failed to moderate message' });
    }
    }
    ```

    ---

    ## Booking System

    ### Booking Controller (booking.controller.ts)

    ```typescript
    import { Response } from 'express';
    import { z } from 'zod';
    import prisma from '../lib/prisma';
    import { AuthRequest } from '../middleware/auth';

    export const BookingStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    } as const;

    const bookingSchema = z.object({
    counselorId: z.string(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    notes: z.string().optional(),
    });

    export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const studentId = req.user?.sub;
        
        if (!studentId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
        }

        const validatedData = bookingSchema.parse(req.body);
        const startAt = new Date(validatedData.startAt);
        const endAt = new Date(validatedData.endAt);

        // Validate minimum 30-minute duration
        const durationMinutes = (endAt.getTime() - startAt.getTime()) / (1000 * 60);
        if (durationMinutes < 30) {
        res.status(400).json({ error: 'Booking must be at least 30 minutes long' });
        return;
        }

        // Validate counselor
        const counselor = await prisma.user.findUnique({
        where: { id: validatedData.counselorId },
        });

        if (!counselor || counselor.role !== 'counselor') {
        res.status(400).json({ error: 'Invalid counselor' });
        return;
        }

        // Check time slot availability (no overlapping bookings)
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
            studentId,
            counselorId: validatedData.counselorId,
            startAt,
            endAt,
            notes: validatedData.notes,
            status: BookingStatus.PENDING,
        },
        include: {
            student: {
            select: { id: true, name: true, email: true },
            },
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
    ```

    ---

    ## API Integration

    ### API Client (lib/api.ts)

    ```typescript
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        });

        if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
        }

        return response.json();
    }

    // Reports
    async getReports(params: { type?: 'weekly' | 'monthly' } = {}) {
        const queryString = new URLSearchParams(params as any).toString();
        return this.request(`/api/admin/reports?${queryString}`);
    }

    async exportReport(format: 'json' | 'csv' | 'pdf' = 'json') {
        return this.request(`/api/admin/reports/export?format=${format}`);
    }

    // Analytics
    async getAnalytics(days: number = 30) {
        return this.request(`/api/admin/analytics?days=${days}`);
    }

    // Crisis
    async createCrisisAlert(message: string) {
        return this.request('/api/crisis/alert', {
        method: 'POST',
        body: JSON.stringify({ message }),
        });
    }

    async getCrisisAlerts() {
        return this.request('/api/crisis/alerts');
    }

    // Bookings
    async createBooking(data: any) {
        return this.request('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
        });
    }

    async getBookings() {
        return this.request('/api/bookings');
    }
    }

    export const api = new ApiClient(API_BASE_URL);
    ```

    ---

    ## Key Features Summary

    ### 1. **Comprehensive Reporting System**
    - Weekly and monthly engagement reports
    - Real-time metrics aggregation
    - Performance tracking for counselors/supporters
    - Support category distribution analysis
    - Export functionality (JSON, CSV, PDF planned)

    ### 2. **Advanced Analytics**
    - User growth timelines
    - Daily activity tracking
    - Peak usage hour analysis
    - Retention rate calculations
    - Risk level distribution
    - Peer tutor performance metrics

    ### 3. **Intelligent Triage System**
    - Automated risk detection
    - Smart routing (Crisis → Book → Peer)
    - Mood score analysis
    - Support room auto-creation

    ### 4. **Crisis Management**
    - Real-time Socket.IO alerts
    - Status tracking (Pending → Acknowledged → Resolved)
    - Counselor notifications
    - Audit logging

    ### 5. **Content Moderation**
    - Message flagging
    - Moderator actions (approve, remove, mute)
    - Comprehensive audit trail

    ### 6. **Data Security**
    - Role-based access control
    - Audit logging for all sensitive operations
    - Activity tracking with IP and user agent
    - Consent management

    ---

    ## Usage Examples

    ### Get Weekly Report
    ```bash
    GET /api/admin/reports?type=weekly
    Authorization: Bearer <token>
    ```

    ### Get Monthly Analytics
    ```bash
    GET /api/admin/analytics?days=30
    Authorization: Bearer <token>
    ```

    ### Create Crisis Alert
    ```bash
    POST /api/crisis/alert
    Authorization: Bearer <token>
    Content-Type: application/json

    {
    "message": "Need urgent help"
    }
    ```

    ### Create Booking
    ```bash
    POST /api/bookings
    Authorization: Bearer <token>
    Content-Type: application/json

    {
    "counselorId": "abc123",
    "startAt": "2025-12-10T14:00:00Z",
    "endAt": "2025-12-10T15:00:00Z",
    "notes": "Follow-up session"
    }
    ```

    ---

    ## Database Queries Examples

    ### Get Active Users in Last 7 Days
    ```typescript
    const activeUsers = await prisma.user.count({
    where: {
        OR: [
        { triageForms: { some: { createdAt: { gte: sevenDaysAgo } } } },
        { bookingsAsStudent: { some: { createdAt: { gte: sevenDaysAgo } } } },
        { peerMessages: { some: { createdAt: { gte: sevenDaysAgo } } } },
        ],
    },
    });
    ```

    ### Get Top Counselors
    ```typescript
    const topCounselors = await prisma.user.findMany({
    where: {
        role: { in: ['counselor', 'moderator'] },
    },
    select: {
        id: true,
        displayName: true,
        _count: {
        select: {
            bookingsAsCounselor: {
            where: { status: 'COMPLETED' },
            },
        },
        },
    },
    orderBy: {
        bookingsAsCounselor: { _count: 'desc' },
    },
    take: 10,
    });
    ```

    ### Get Crisis Alerts
    ```typescript
    const alerts = await prisma.crisisAlert.findMany({
    where: {
        status: { in: ['PENDING', 'ACKNOWLEDGED'] },
    },
    include: {
        user: {
        select: { id: true, name: true, email: true },
        },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    });
    ```

    ---

    ## Performance Optimizations

    1. **Parallel Data Fetching**: Use `Promise.all()` for independent queries
    2. **Indexed Queries**: All foreign keys and frequently queried fields have indexes
    3. **Selective Field Loading**: Use `select` to load only needed fields
    4. **Pagination**: Implement `take` and `skip` for large datasets
    5. **Caching**: Consider Redis for frequently accessed reports (future enhancement)

    ---

    ## Security Best Practices

    1. **Authentication**: JWT tokens with role-based access
    2. **Authorization**: Middleware checks for admin/counselor/moderator roles
    3. **Input Validation**: Zod schemas for all request data
    4. **Audit Logging**: Track all sensitive operations
    5. **Data Privacy**: Age bracket segregation and consent management
    6. **SQL Injection Prevention**: Prisma ORM parameterized queries

    ---

    **End of Documentation**
