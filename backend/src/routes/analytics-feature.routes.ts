import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import {
  getAnalytics,
  getDetailedReport,
  exportAnalyticsData,
  getUserGrowthMetrics,
  getEngagementMetrics,
} from '../controllers/analytics.controller';

const router = Router();

// All analytics routes require authentication and admin role
router.use(auth);
router.use(requireRole(['admin', 'counselor']));

// Main analytics endpoints
router.get('/', getAnalytics);                        // Get overview analytics
router.get('/detailed', getDetailedReport);           // Detailed analytics report
router.get('/user-growth', getUserGrowthMetrics);     // User growth over time
router.get('/engagement', getEngagementMetrics);      // Engagement metrics

// Export functionality
router.get('/export', exportAnalyticsData);           // Export data as CSV

export default router;
