import {createPoolFactory_PSQL} from './poolFactory_psql.js';
import type {PoolType} from './poolFactory_psql.js';
import { RedisManager } from './redisService.js';


const isDev = process.env.NODE_ENV === 'development';


const pool: PoolType = createPoolFactory_PSQL();

const redisPool  = new RedisManager({
    host: (isDev ? process.env.DEV_REDIS_CLIENT_HOST : process.env.REDIS_CLIENT_HOST) || 'localhost',
    port: Number(process.env.REDIS_CLIENT_PORT) || 6379,
});
await redisPool.connect();

const redisLegacyPool  = new RedisManager({
    host: (isDev ? process.env.DEV_REDIS_CLIENT_HOST : process.env.REDIS_CLIENT_HOST) || 'localhost',
    port: Number(process.env.REDIS_CLIENT_PORT) || 6379,
    options: {
        legacyMode: true,
    }
});
await redisLegacyPool.connect();


export {pool, redisPool, redisLegacyPool};