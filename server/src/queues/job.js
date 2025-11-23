import { Queue } from 'bullmq';
import redisClient from '../config/redis.js';

const jobQueue = new Queue('job-import', {
    connection: redisClient
});

export default jobQueue;