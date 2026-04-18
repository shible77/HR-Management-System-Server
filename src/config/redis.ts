import IORedis from "ioredis";

interface RedisConnectionConfig {
  host: string;
  port: number;
  maxRetriesPerRequest: null;
  enableReadyCheck: boolean;
  lazyConnect: boolean;
  reconnectOnError(err: Error): boolean;
}

export const redisConnection: RedisConnectionConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,

    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    reconnectOnError(err: Error): boolean {
    console.error("Redis reconnecting:", err.message);
    return true;
  },
};


export const redis: IORedis = new IORedis(redisConnection);