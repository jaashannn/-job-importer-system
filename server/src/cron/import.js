import cron from 'node-cron';
import runImportProcess from '../services/import.js';
import logger from '../utils/logger.js';

// Get cron schedule from environment or use default (every hour)
const cronSchedule = process.env.CRON_SCHEDULE || '0 * * * *';

// Start cron job
const startImportCron = () => {
    logger.info(`Cron job scheduled: ${cronSchedule}`);
    logger.info('Import will run automatically on schedule');

    cron.schedule(cronSchedule, async () => {
        logger.info('\n=== Cron Job Triggered: Starting Import ===');
        logger.info(`Time: ${new Date().toISOString()}`);
        
        try {
            const result = await runImportProcess();
            
            if (result.success) {
                logger.success('Cron import completed successfully');
                logger.info(`Total jobs queued: ${result.data.totalJobsQueued}`);
            } else {
                logger.error('Cron import failed:', result.message);
            }
        } catch (error) {
            logger.error('Error in cron import:', error.message);
            logger.error('Stack trace:', error.stack);
        }
        
        logger.info('=== Cron Job Completed ===\n');
    }, {
        scheduled: true,
        timezone: "UTC"
    });
};

export default startImportCron;

