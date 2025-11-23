import Redis from 'ioredis';
import logger from '../utils/logger.js';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

redisClient.on('connect', () => {
    logger.success('Redis connected');
});

redisClient.on('error', (error) => {
    logger.error('Redis error:', error.message);
});


export default redisClient;
