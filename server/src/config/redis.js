import Redis from 'ioredis';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

redisClient.on('connect',()=>{
    console.log('Redis connected');
});

redisClient.on('error',(error)=>{
    console.error('Redis error',error);
});


export default redisClient;
