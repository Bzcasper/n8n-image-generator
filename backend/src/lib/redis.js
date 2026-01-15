import Redis from 'ioredis';

let redisClient = null;
let fallbackMode = false;

const ANONYMOUS_LIMIT = 10;
const AUTHENTICATED_LIMIT = 100;
const LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const rateLimitCache = new Map();

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('REDIS_URL not configured. Using in-memory fallback for rate limiting.');
    fallbackMode = true;
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries. Falling back to in-memory rate limiting.');
          fallbackMode = true;
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      enableReadyCheck: true,
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
      fallbackMode = true;
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
      fallbackMode = false;
    });

    redisClient.on('close', () => {
      console.warn('Redis client closed. Falling back to in-memory rate limiting.');
      fallbackMode = true;
    });

    await redisClient.ping();
    console.log('Redis connection established');
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    console.warn('Using in-memory fallback for rate limiting.');
    fallbackMode = true;
    return null;
  }
}

export function isFallbackMode() {
  return fallbackMode;
}

export async function getRateLimit(identifier, isAuthenticated) {
  const limit = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;
  const now = Date.now();

  if (fallbackMode || !redisClient) {
    return getRateLimitFallback(identifier, isAuthenticated, limit, now);
  }

  try {
    const key = `rate_limit:${identifier}`;
    const data = await redisClient.hgetall(key);

    if (!data || !data.resetAt || parseInt(data.resetAt, 10) < now) {
      const resetAt = now + LIMIT_WINDOW_MS;
      await redisClient.hset(key, {
        identifier,
        count: 0,
        resetAt,
      });
      await redisClient.expire(key, Math.ceil(LIMIT_WINDOW_MS / 1000));

      return {
        canGenerate: true,
        remaining: limit,
        resetAt: new Date(resetAt),
        limit,
      };
    }

    const count = parseInt(data.count, 10);
    const resetAt = parseInt(data.resetAt, 10);

    return {
      canGenerate: count < limit,
      remaining: Math.max(0, limit - count),
      resetAt: new Date(resetAt),
      limit,
    };
  } catch (error) {
    console.error('Redis error in getRateLimit, falling back:', error);
    fallbackMode = true;
    return getRateLimitFallback(identifier, isAuthenticated, limit, now);
  }
}

export async function incrementRateLimit(identifier) {
  if (fallbackMode || !redisClient) {
    incrementRateLimitFallback(identifier);
    return;
  }

  try {
    const key = `rate_limit:${identifier}`;
    const data = await redisClient.hgetall(key);

    if (data && data.resetAt && parseInt(data.resetAt, 10) > Date.now()) {
      await redisClient.hincrby(key, 'count', 1);
    }
  } catch (error) {
    console.error('Redis error in incrementRateLimit, falling back:', error);
    fallbackMode = true;
    incrementRateLimitFallback(identifier);
  }
}

function getRateLimitFallback(identifier, isAuthenticated, limit, now) {
  const record = rateLimitCache.get(identifier);

  if (!record || record.resetAt < now) {
    const newRecord = {
      identifier,
      count: 0,
      resetAt: now + LIMIT_WINDOW_MS,
    };
    rateLimitCache.set(identifier, newRecord);
    return {
      canGenerate: true,
      remaining: limit,
      resetAt: new Date(newRecord.resetAt),
      limit,
    };
  }

  return {
    canGenerate: record.count < limit,
    remaining: Math.max(0, limit - record.count),
    resetAt: new Date(record.resetAt),
    limit,
  };
}

function incrementRateLimitFallback(identifier) {
  const record = rateLimitCache.get(identifier);
  if (record && record.resetAt > Date.now()) {
    record.count++;
  }
}

export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
