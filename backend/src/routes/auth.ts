import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
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
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  UpdateProfileInput,
} from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';

const prisma = new PrismaClient();

export async function authRoutes(fastify: FastifyInstance) {
  // User registration
  fastify.post('/register', {
    schema: {
      body: registerSchema,
      response: {
        201: z.object({
          user: z.object({
            id: z.string(),
            email: z.string(),
            username: z.string().nullable(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            role: z.string(),
            createdAt: z.string(),
          }),
          accessToken: z.string(),
          refreshToken: z.string(),
        }),
        400: z.object({ error: z.string() }),
        409: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const body = request.body as RegisterInput;
      const { email, password, username, firstName, lastName } = body;

      // Check if user already exists
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

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
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

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      reply.code(201).send({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // User login
  fastify.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: z.object({
          user: z.object({
            id: z.string(),
            email: z.string(),
            username: z.string().nullable(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            role: z.string(),
          }),
          accessToken: z.string(),
          refreshToken: z.string(),
        }),
        401: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const body = request.body as LoginInput;
      const { email, password } = body;

      // Find user
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

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Create session (invalidate old refresh tokens for this user)
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      reply.send({
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Refresh access token
  fastify.post('/refresh', {
    schema: {
      body: refreshTokenSchema,
      response: {
        200: z.object({
          accessToken: z.string(),
        }),
        401: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const body = request.body as RefreshTokenInput;
      const { refreshToken } = body;

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return reply.code(401).send({ error: 'Invalid refresh token' });
      }

      // Check if session exists and is valid
      const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Refresh token expired' });
      }

      // Generate new access token
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

  // Logout
  fastify.post('/logout', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        if (payload) {
          // Delete all sessions for this user
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

  // Get current user profile
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

  // Update user profile
  fastify.put('/me', {
    preHandler: authenticate,
    schema: {
      body: updateProfileSchema,
      response: {
        200: z.object({
          user: z.object({
            id: z.string(),
            email: z.string(),
            username: z.string().nullable(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            avatar: z.string().nullable(),
            updatedAt: z.string(),
          }),
        }),
        400: z.object({ error: z.string() }),
        409: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const updates = request.body as UpdateProfileInput;
      const userId = request.user!.userId;

      // Check for username conflicts
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