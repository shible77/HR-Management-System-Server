import IORedis from "ioredis";

/**
 * Supports two environments automatically:
 *
 *  Local / Docker  →  reads REDIS_HOST + REDIS_PORT
 *  Render          →  reads REDIS_URL  (injected automatically when a Redis
 *                     instance is linked to the service in render.yaml)
 *
 * REDIS_URL takes priority when present.
 */

const bullMQOverrides = {
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,   // BullMQ manages readiness itself
  lazyConnect: true,
  reconnectOnError(err: Error): boolean {
    console.error("[Redis/BullMQ] reconnecting:", err.message);
    return true;
  },
};

/**
 * Connection options passed to BullMQ Queue + Worker constructors.
 * When REDIS_URL is present IORedis parses it; otherwise uses HOST+PORT.
 */
export const bullMQConnectionOptions: Record<string, unknown> =
  process.env.REDIS_URL
    ? { url: process.env.REDIS_URL, ...bullMQOverrides }
    : {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        ...bullMQOverrides,
      };

/**
 * Standalone IORedis client used ONLY by the payroll worker for
 * distributed locking (redis.set / redis.del).
 * Call `await redis.connect()` once at worker startup before use.
 */
const lockOverrides = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  reconnectOnError(err: Error): boolean {
    console.error("[Redis/lock] reconnecting:", err.message);
    return true;
  },
};

export const redis: IORedis = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, lockOverrides)
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      ...lockOverrides,
    });

/** @deprecated — use bullMQConnectionOptions */
export const redisConnection = bullMQConnectionOptions;