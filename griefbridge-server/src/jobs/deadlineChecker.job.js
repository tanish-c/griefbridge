import cron from 'node-cron';
import { checkDeadlines } from '../services/notification.service.js';

export function startDeadlineChecker() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running deadline checker job...');
      await checkDeadlines();
    } catch (error) {
      console.error('Deadline checker job failed:', error);
    }
  });

  // Also run on startup after 5 seconds
  setTimeout(() => {
    checkDeadlines();
  }, 5000);

  console.log('Deadline checker job started - runs every hour');
}
