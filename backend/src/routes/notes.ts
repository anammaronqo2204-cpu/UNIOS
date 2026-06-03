import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router({ mergeParams: true });

const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(), // JSON string
  tags: z.array(z.string()).optional(),
});

const updateNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  is_pinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /courses/:courseId/notes - List notes for course
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const notes = await db('notes')
      .where({ user_id: req.user!.userId, course_id: req.params.courseId })
      .select('*')
      .orderBy('is_pinned', 'desc')
      .orderBy('updated_at', 'desc');

    res.json(notes.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content ? JSON.parse(n.content) : null,
      aiSummary: n.ai_summary,
      isPinned: !!n.is_pinned,
      tags: n.tags ? JSON.parse(n.tags) : [],
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    })));
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /courses/:courseId/notes - Create note
router.post('/', authenticate, validate(createNoteSchema), async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    const id = uuidv4();

    // Verify course belongs to user
    const course = await db('courses')
      .where({ id: req.params.courseId, user_id: req.user!.userId })
      .first();

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await db('notes').insert({
      id,
      user_id: req.user!.userId,
      course_id: req.params.courseId,
      title: title || 'Untitled Note',
      content: content || null,
      tags: tags ? JSON.stringify(tags) : null,
    });

    const note = await db('notes').where({ id }).first();

    res.status(201).json({
      id: note.id,
      title: note.title,
      content: note.content ? JSON.parse(note.content) : null,
      isPinned: false,
      tags: note.tags ? JSON.parse(note.tags) : [],
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /notes/:id - Get note detail
router.get('/:noteId', authenticate, async (req: Request, res: Response) => {
  try {
    const note = await db('notes')
      .where({ id: req.params.noteId, user_id: req.user!.userId })
      .first();

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({
      id: note.id,
      courseId: note.course_id,
      title: note.title,
      content: note.content ? JSON.parse(note.content) : null,
      aiSummary: note.ai_summary,
      isPinned: !!note.is_pinned,
      tags: note.tags ? JSON.parse(note.tags) : [],
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    });
  } catch (err) {
    console.error('Get note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /notes/:id - Update note
router.patch('/:noteId', authenticate, validate(updateNoteSchema), async (req: Request, res: Response) => {
  try {
    const note = await db('notes')
      .where({ id: req.params.noteId, user_id: req.user!.userId })
      .first();

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    const updates: any = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.content !== undefined) updates.content = req.body.content;
    if (req.body.is_pinned !== undefined) updates.is_pinned = req.body.is_pinned ? 1 : 0;
    if (req.body.tags !== undefined) updates.tags = JSON.stringify(req.body.tags);
    updates.updated_at = new Date().toISOString();

    await db('notes').where({ id: req.params.noteId }).update(updates);

    const updated = await db('notes').where({ id: req.params.noteId }).first();

    res.json({
      id: updated.id,
      courseId: updated.course_id,
      title: updated.title,
      content: updated.content ? JSON.parse(updated.content) : null,
      aiSummary: updated.ai_summary,
      isPinned: !!updated.is_pinned,
      tags: updated.tags ? JSON.parse(updated.tags) : [],
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /notes/:id - Delete note
router.delete('/:noteId', authenticate, async (req: Request, res: Response) => {
  try {
    const note = await db('notes')
      .where({ id: req.params.noteId, user_id: req.user!.userId })
      .first();

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    await db('notes').where({ id: req.params.noteId }).del();

    res.status(204).send();
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;