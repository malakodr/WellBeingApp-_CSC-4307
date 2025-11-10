import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const crisisAlertQueue = new Queue('crisis-alerts', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

interface CrisisAlertJobData {
  alertId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
}

export const addCrisisAlertJob = async (data: CrisisAlertJobData) => {
  await crisisAlertQueue.add('process-crisis-alert', data, {
    priority: 1, // High priority
  });
};
