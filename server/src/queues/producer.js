import jobQueue from './job.js';

const addJobsToQueue = async (normalizedJobs) => {
    try {
        if (!normalizedJobs || normalizedJobs.length === 0) {
            console.log('No jobs to add to queue');
            return [];
        }

        const jobPromises = [];

        // Loop through each normalized job and add to queue
        for (const job of normalizedJobs) {
            const jobPromise = jobQueue.add('import-job', job, {
                jobId: job.externalId,  // Use externalId as unique job ID
                removeOnComplete: true,   // Remove when completed
                removeOnFail: false      // Keep failed jobs for debugging
            });
            jobPromises.push(jobPromise);
        }

        // Wait for all jobs to be added
        const addedJobs = await Promise.all(jobPromises);
        
        console.log(`Added ${addedJobs.length} jobs to queue`);
        return addedJobs;
    } catch (error) {
        console.error('Error adding jobs to queue:', error.message);
        throw error;
    }
};

export default addJobsToQueue;