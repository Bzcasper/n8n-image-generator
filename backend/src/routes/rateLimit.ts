import { FastifyInstance } from 'fastify';
import { optionalAuthenticate } from '../middleware/auth.js';
import { getRateLimit, incrementRateLimit, getRedisClient, closeRedisClient } from '../lib/redis.js';

export async function rateLimitRoutes(fastify: FastifyInstance) {
  fastify.addHook('onClose', async () => {
    await closeRedisClient();
  });

  fastify.get('/check-rate-limit', {
    preHandler: optionalAuthenticate,
  }, async (request, reply) => {
    try {
      const isAuthenticated = !!request.user;
      const identifier = request.user?.userId || request.ip;

      await getRedisClient();
      const limitInfo = await getRateLimit(identifier, isAuthenticated);

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

      await getRedisClient();
      await incrementRateLimit(identifier);

      const limitInfo = await getRateLimit(identifier, isAuthenticated);

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
