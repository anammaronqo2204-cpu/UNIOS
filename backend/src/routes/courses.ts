import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(200),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const updateCourseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// GET /courses - List user's courses
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const courses = await db('courses')
      .where({ user_id: req.user!.userId })
      .select('*')
      .orderBy('created_at', 'desc');

    res.json(courses.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      color: c.color,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })));
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /courses - Create course
router.post('/', authenticate, validate(createCourseSchema), async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;
    const id = uuidv4();

    await db('courses').insert({
      id,
      user_id: req.user!.userId,
      name,
      description: description || null,
      color: color || '#7C3AED',
    });

    const course = await db('courses').where({ id }).first();

    res.status(201).json({
      id: course.id,
      name: course.name,
      description: course.description,
      color: course.color,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /courses/:id - Get course detail
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const course = await db('courses')
      .where({ id: req.params.id, user_id: req.user!.userId })
      .first();

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json({
      id: course.id,
      name: course.name,
      description: course.description,
      color: course.color,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /courses/:id - Update course
router.patch('/:id', authenticate, validate(updateCourseSchema), async (req: Request, res: Response) => {
  try {
    const course = await db('courses')
      .where({ id: req.params.id, user_id: req.user!.userId })
      .first();

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.color !== undefined) updates.color = req.body.color;
    updates.updated_at = new Date().toISOString();

    await db('courses').where({ id: req.params.id }).update(updates);

    const updated = await db('courses').where({ id: req.params.id }).first();

    res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      color: updated.color,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /courses/:id - Delete course
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const course = await db('courses')
      .where({ id: req.params.id, user_id: req.user!.userId })
      .first();

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await db('courses').where({ id: req.params.id }).del();

    res.status(204).send();
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;