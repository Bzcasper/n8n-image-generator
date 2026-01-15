import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  verifyRefreshToken,
  verifyAccessToken,
} from '../utils/auth.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
} from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    try {
      const body = request.body as {
        email: string;
        password: string;
        username?: string;
        firstName?: string;
        lastName?: string;
      };
      const validation = registerSchema.safeParse(body);

      if (!validation.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validation.error.issues
        });
      }

      const { email, password, username, firstName, lastName } = validation.data;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(username ? [{ username }] : []),
          ],
        },
      });

      if (existingUser) {
        return reply.code(409).send({
          error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
        });
      }

      const hashedPassword = await hashPassword(password);

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            firstName,
            lastName,
          },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        });

        const tokens = generateTokenPair({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        await tx.session.create({
          data: {
            userId: user.id,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        return { user, tokens };
      });

      reply.code(201).send({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        const prismaError = error as { code: string; meta?: { target?: string[] } };
        return reply.code(409).send({
          error: 'Email already registered',
          field: prismaError.meta?.target,
        });
      }
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const body = request.body as {
        email: string;
        password: string;
      };
      const validation = loginSchema.safeParse(body);

      if (!validation.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validation.error.issues
        });
      }

      const { email, password: loginPassword } = validation.data;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          password: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const isValidPassword = await verifyPassword(loginPassword, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.session.deleteMany({
          where: { userId: user.id },
        });

        await tx.session.create({
          data: {
            userId: user.id,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });

      reply.send({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/refresh', async (request, reply) => {
    try {
      const body = request.body as {
        refreshToken: string;
      };
      const validation = refreshTokenSchema.safeParse(body);

      if (!validation.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validation.error.issues
        });
      }

      const { refreshToken } = validation.data;

      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return reply.code(401).send({ error: 'Invalid refresh token' });
      }

      const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Refresh token expired' });
      }

      const accessToken = generateTokenPair({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      }).accessToken;

      reply.send({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/logout', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (payload) {
          await prisma.session.deleteMany({
            where: { userId: payload.userId },
          });
        }
      }

      reply.send({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/me', {
    preHandler: authenticate,
  }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user!.userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      reply.send({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.put('/me', {
    preHandler: authenticate,
  }, async (request, reply) => {
    try {
      const body = request.body as {
        username?: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
      };
      const validation = updateProfileSchema.safeParse(body);

      if (!validation.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validation.error.issues
        });
      }

      const updates = validation.data;
      const userId = request.user!.userId;

      if (updates.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: updates.username,
            id: { not: userId },
          },
        });

        if (existingUser) {
          return reply.code(409).send({ error: 'Username already taken' });
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          updatedAt: true,
        },
      });

      reply.send({ user });
    } catch (error) {
      console.error('Update profile error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
