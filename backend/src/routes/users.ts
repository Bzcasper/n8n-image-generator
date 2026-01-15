import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import { createImageSchema } from '../utils/validation.js';
import { prisma } from '../lib/prisma.js';

export async function userRoutes(fastify: FastifyInstance) {
  // Get user's generated images
  fastify.get('/images', {
    preHandler: authenticate,
  }, async (request, reply) => {
    try {
      const images = await prisma.generatedImage.findMany({
        where: { userId: request.user!.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      reply.send({ images });
    } catch (error) {
      console.error('Get images error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create new generated image (for tracking purposes)
  fastify.post('/images', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const validation = createImageSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: validation.error.issues,
      });
    }

    const { prompt, imageUrl, style, size, quality, seed } = validation.data;

    try {
      const image = await prisma.generatedImage.create({
        data: {
          userId: request.user!.userId,
          prompt,
          imageUrl,
          style,
          size,
          quality,
          seed,
        },
      });

      reply.code(201).send({ image });
    } catch (error) {
      console.error('Create image error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
