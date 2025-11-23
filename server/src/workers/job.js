import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import redisClient from '../config/redis.js';
import connectDB from '../config/db.js';
import Job from '../models/job.js';
import Log from '../models/log.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

// Get concurrency from environment or use default
const concurrency = parseInt(process.env.QUEUE_CONCURRENCY) || 5;

// Create worker instance
const worker = new Worker('job-import', async (job) => {
    try {
        const jobData = job.data;
        logger.info(`Processing job: ${jobData.externalId} - ${jobData.title}`);

        // Check if job already exists in database
        const existingJob = await Job.findOne({ externalId: jobData.externalId });

        if (existingJob) {
            // Job exists, update it
            existingJob.title = jobData.title;
            existingJob.company = jobData.company;
            existingJob.url = jobData.url;
            existingJob.description = jobData.description;
            existingJob.location = jobData.location;
            
            await existingJob.save();
            logger.info(`Updated job: ${jobData.externalId}`);

            // Update import log counters
            const recentLog = await Log.findOne().sort({ timestamp: -1 });
            if (recentLog) {
                recentLog.updatedJobs = (recentLog.updatedJobs || 0) + 1;
                await recentLog.save();
            }

            return { action: 'updated', jobId: existingJob._id };
        } else {
            // Job doesn't exist, create new one
            const newJob = await Job.create(jobData);
            logger.success(`Created new job: ${jobData.externalId}`);

            // Update import log counters
            const recentLog = await Log.findOne().sort({ timestamp: -1 });
            if (recentLog) {
                recentLog.newJobs = (recentLog.newJobs || 0) + 1;
                await recentLog.save();
            }

            return { action: 'created', jobId: newJob._id };
        }

    } catch (error) {
        logger.error(`Error processing job ${job.data.externalId}:`, error.message);
        
        // Handle duplicate key error (externalId already exists)
        if (error.code === 11000) {
            logger.warn(`Job ${job.data.externalId} already exists, skipping...`);
            return { action: 'skipped', reason: 'duplicate' };
        }

        // Update import log with failed job
        try {
            const recentLog = await Log.findOne().sort({ timestamp: -1 });
            if (recentLog) {
                recentLog.failedJobs.push({
                    externalId: job.data.externalId,
                    error: error.message,
                    jobData: job.data
                });
                await recentLog.save();
            }
        } catch (logError) {
            logger.error('Error updating log with failed job:', logError.message);
        }

        // Re-throw error so BullMQ can retry if configured
        throw error;
    }
}, {
    connection: redisClient,
    concurrency: concurrency  // Process multiple jobs concurrently
});

// Worker event listeners

// When a job is completed
worker.on('completed', (job) => {
    logger.success(`Job ${job.id} completed successfully`);
});

// When a job fails
worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err.message);
});

// When worker is ready
worker.on('ready', () => {
    logger.info('Worker is ready to process jobs');
});

// When worker encounters an error
worker.on('error', (err) => {
    logger.error('Worker error:', err.message);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing worker...');
    await worker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing worker...');
    await worker.close();
    process.exit(0);
});

logger.info('Worker started and waiting for jobs...');

