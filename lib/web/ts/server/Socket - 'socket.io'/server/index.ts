// install package from npm
import { createAdapter as createSocketIORedisAdapter } from "@socket.io/redis-adapter";

// use lib ready tools
import { RedisManager } from "./core/services/connection/redisService.js";
import { SocketBusSingleton } from "./core/services/connection/socketEventBusSingleton.js";

// set .env settings is necessary



// Place this code after creating the server, but before final server listening init
const REDIS_HOST = isDev 
  ? process.env.DEV_REDIS_CLIENT_HOST 
  : process.env.REDIS_CLIENT_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_CLIENT_PORT ?? '', 10) || 6379;

// Create Redis connection
const redisConnectionConfig = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};
const redis_pubClient = new RedisManager(redisConnectionConfig);
const redis_subClient = new RedisManager(redisConnectionConfig);
await redis_pubClient.connect();
await redis_subClient.connect();

// Socket IO
const ioRedisAdapter = createSocketIORedisAdapter(
    redis_pubClient.getClient(), 
    redis_subClient.getClient()
);
// Use environment variable for allowed CORS origin, fallback to '*'
const SOCKETIO_CORS_ORIGIN = process.env.SOCKETIO_CORS_ORIGIN || "*";
const SOCKETIO_CORS_METHODS = (process.env.SOCKETIO_CORS_METHODS || "GET,POST").split(',');
const socketIO_options = {
    cors: {
        origin: SOCKETIO_CORS_ORIGIN,
        methods: SOCKETIO_CORS_METHODS
    }
};
SocketBusSingleton.init({
    server, 
    adapter: ioRedisAdapter, 
    options: socketIO_options
});
