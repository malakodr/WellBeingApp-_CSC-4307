import { Worker } from 'bullmq';
import Redis from 'ioredis';
import prisma from '../lib/prisma';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

interface CrisisAlertJobData {
  alertId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
}

export const crisisAlertWorker = new Worker<CrisisAlertJobData>(
  'crisis-alerts',
  async (job) => {
    const { alertId, userId, userName, userEmail, message } = job.data;

    console.log('\n===========================================');
    console.log('🚨 CRISIS ALERT DETECTED 🚨');
    console.log('===========================================');
    console.log(`Alert ID: ${alertId}`);
    console.log(`User: ${userName} (${userEmail})`);
    console.log(`User ID: ${userId}`);
    console.log(`Message: ${message}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('===========================================\n');

    // In production, you would:
    // 1. Send email to crisis response team
    // 2. Send SMS notification
    // 3. Trigger real-time notification to counselors
    // 4. Log to monitoring system

    // Update alert status
    await prisma.crisisAlert.update({
      where: { id: alertId },
      data: { status: 'ACKNOWLEDGED' },
    });

    return { success: true, alertId };
  },
  {
    connection,
    concurrency: 5,
  }
);

crisisAlertWorker.on('completed', (job) => {
  console.log(`✅ Crisis alert job ${job.id} completed successfully`);
});

crisisAlertWorker.on('failed', (job, err) => {
  console.error(`❌ Crisis alert job ${job?.id} failed:`, err);
});

export default crisisAlertWorker;
