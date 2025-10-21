import {createPoolFactory_PSQL} from './poolFactory_psql.js';
import type {PoolType} from './poolFactory_psql.js';
import dotenv from 'dotenv';
import { RedisManager } from './redisService.js';


dotenv.config();
const isDev = process.env.NODE_ENV === 'development';


const pool: PoolType = createPoolFactory_PSQL();

const redisPool  = new RedisManager({
    host: (isDev ? process.env.DEV_REDIS_CLIENT_HOST : process.env.REDIS_CLIENT_HOST) || 'localhost',
    port: Number(process.env.REDIS_CLIENT_PORT) || 6379,
});
await redisPool.connect();

//#FIXME loginLimiter конфликтует с новым редис (проброс легаиси не помог)
const redisLegacyPool  = new RedisManager({
    host: (isDev ? process.env.DEV_REDIS_CLIENT_HOST : process.env.REDIS_CLIENT_HOST) || 'localhost',
    port: Number(process.env.REDIS_CLIENT_PORT) || 6379,
    options: {
        legacyMode: true,
    }
});
await redisLegacyPool.connect();


export {pool, redisPool, redisLegacyPool};