import feeds from '../config/feeds.js';
import fetchFeed, { extractItems } from './fetcher.js';
import parseJob from './parser.js';
import addJobsToQueue from '../queues/producer.js';
import Log from '../models/log.js';
import logger from '../utils/logger.js';

// Service function to run import process (reusable by controller and cron)
const runImportProcess = async () => {
    try {
        logger.info('Starting import process...');
        
        let totalFetched = 0;
        let allNormalizedJobs = [];
        const importLogs = [];

        // Loop through each feed
        for (const feed of feeds) {
            try {
                logger.info(`Processing feed: ${feed.name}`);
                
                // Fetch feed data
                const feedData = await fetchFeed(feed.url, feed.type);
                
                // Extract items from RSS/XML structure
                const items = extractItems(feedData);
                
                if (!items || items.length === 0) {
                    logger.warn(`No items found in feed: ${feed.name}`);
                    continue;
                }

                totalFetched += items.length;
                logger.info(`Found ${items.length} items in feed: ${feed.name}`);

                // Parse and normalize each job
                const normalizedJobs = items
                    .map(item => parseJob(item, feed.name))
                    .filter(job => job !== null); // Remove failed parses

                logger.info(`Normalized ${normalizedJobs.length} jobs from feed: ${feed.name}`);

                // Add normalized jobs to the array
                allNormalizedJobs = allNormalizedJobs.concat(normalizedJobs);

                // Create initial import log entry for this feed
                const importLog = await Log.create({
                    timestamp: new Date(),
                    fileName: feed.name,
                    totalFetched: items.length,
                    newJobs: 0,  // Will be updated by worker
                    updatedJobs: 0,  // Will be updated by worker
                    failedJobs: []
                });

                importLogs.push(importLog);
                
            } catch (feedError) {
                logger.error(`Error processing feed ${feed.name}:`, feedError.message);
                // Continue with next feed even if one fails
            }
        }

        if (allNormalizedJobs.length === 0) {
            logger.warn('No jobs found to import');
            return {
                success: false,
                message: 'No jobs found to import',
                data: null
            };
        }

        // Add all normalized jobs to queue
        logger.info(`Adding ${allNormalizedJobs.length} jobs to queue...`);
        await addJobsToQueue(allNormalizedJobs);

        logger.success(`Import process completed. ${allNormalizedJobs.length} jobs queued.`);

        return {
            success: true,
            message: 'Import process started',
            data: {
                totalFeeds: feeds.length,
                totalFetched,
                totalJobsQueued: allNormalizedJobs.length,
                importLogs: importLogs.map(log => ({
                    id: log._id,
                    fileName: log.fileName,
                    timestamp: log.timestamp
                }))
            }
        };

    } catch (error) {
        logger.error('Error in runImportProcess:', error.message);
        logger.error('Stack trace:', error.stack);
        return {
            success: false,
            message: 'Error starting import process',
            error: error.message
        };
    }
};

export default runImportProcess;

