import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const prisma = new PrismaClient();

export async function userRoutes(fastify: FastifyInstance) {
  // Get user's generated images
  fastify.get('/images', {
    preHandler: authenticate,
  }, async (request, reply) => {
    try {
      const images = await prisma.generatedImage.findMany({
        where: { userId: request.user!.userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to recent 50 images
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
    try {
      const { prompt, imageUrl, style, size, quality, seed } = request.body as {
        prompt: string;
        imageUrl: string;
        style?: string;
        size?: string;
        quality?: string;
        seed?: number;
      };

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