import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { generateToken, generateRefreshToken, authenticate, AuthPayload } from '../middleware/auth';
import { validate } from '../middleware/validate';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const router = Router();

// Schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existing = await db('users').where({ email }).first();
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Create user
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);

    await db('users').insert({
      id,
      email,
      name,
      password_hash: passwordHash,
      plan_tier: 'free',
    });

    const payload: AuthPayload = { userId: id, email, planTier: 'free' };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      user: { id, email, name, planTier: 'free' },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      planTier: user.plan_tier,
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planTier: user.plan_tier,
        avatarUrl: user.avatar_url,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as AuthPayload;

    // Verify user still exists
    const user = await db('users').where({ id: decoded.userId }).first();
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      planTier: user.plan_tier,
    };

    const newToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'name', 'plan_tier', 'avatar_url', 'created_at')
      .where({ id: req.user!.userId })
      .first();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      planTier: user.plan_tier,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;