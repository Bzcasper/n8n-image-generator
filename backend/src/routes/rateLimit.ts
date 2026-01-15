import { FastifyInstance } from 'fastify';
import { optionalAuthenticate } from '../middleware/auth.js';

const ANONYMOUS_LIMIT = 10;
const AUTHENTICATED_LIMIT = 100;
const LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

interface RateLimitRecord {
  identifier: string;
  count: number;
  resetAt: Date;
}

const rateLimitCache = new Map<string, RateLimitRecord>();

function getRateLimit(identifier: string, isAuthenticated: boolean) {
  const record = rateLimitCache.get(identifier);
  const now = new Date();
  const limit = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;

  if (!record || record.resetAt < now) {
    const newRecord: RateLimitRecord = {
      identifier,
      count: 0,
      resetAt: new Date(now.getTime() + LIMIT_WINDOW_MS),
    };
    rateLimitCache.set(identifier, newRecord);
    return {
      canGenerate: true,
      remaining: limit,
      resetAt: newRecord.resetAt,
      limit,
    };
  }

  return {
    canGenerate: record.count < limit,
    remaining: Math.max(0, limit - record.count),
    resetAt: record.resetAt,
    limit,
  };
}

function incrementRateLimit(identifier: string) {
  const record = rateLimitCache.get(identifier);
  if (record && record.resetAt > new Date()) {
    record.count++;
  }
}

export async function rateLimitRoutes(fastify: FastifyInstance) {
  fastify.get('/check-rate-limit', {
    preHandler: optionalAuthenticate,
  }, async (request, reply) => {
    try {
      const isAuthenticated = !!request.user;
      const identifier = request.user?.userId || request.ip;

      const limitInfo = getRateLimit(identifier, isAuthenticated);

      reply.send({
        ...limitInfo,
        isAuthenticated,
      });
    } catch (error) {
      console.error('Rate limit check error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/increment-generation', {
    preHandler: optionalAuthenticate,
  }, async (request, reply) => {
    try {
      const isAuthenticated = !!request.user;
      const identifier = request.user?.userId || request.ip;

      incrementRateLimit(identifier);

      const limitInfo = getRateLimit(identifier, isAuthenticated);

      reply.send({
        ...limitInfo,
        isAuthenticated,
      });
    } catch (error) {
      console.error('Rate limit increment error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
