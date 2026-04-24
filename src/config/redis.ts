import IORedis from "ioredis";

export const bullMQConnectionOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
  lazyConnect: true,
  reconnectOnError(err: Error): boolean {
    console.error("[Redis] reconnecting after error:", err.message);
    return true;
  },
};


export const redis = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  reconnectOnError(err: Error): boolean {
    console.error("[Redis lock client] reconnecting:", err.message);
    return true;
  },
});

export const redisConnection = bullMQConnectionOptions;