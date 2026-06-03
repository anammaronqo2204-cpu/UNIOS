import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000),
  courseId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
});

// POST /tutor/chat - Start or continue tutoring session
router.post('/chat', authenticate, validate(chatSchema), async (req: Request, res: Response) => {
  try {
    const { message, courseId, sessionId } = req.body;
    let session;

    // Find or create session
    if (sessionId) {
      session = await db('ai_sessions')
        .where({ id: sessionId, user_id: req.user!.userId })
        .first();

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
    } else {
      const id = uuidv4();
      await db('ai_sessions').insert({
        id,
        user_id: req.user!.userId,
        course_id: courseId || null,
        title: message.slice(0, 100),
      });
      session = await db('ai_sessions').where({ id }).first();
    }

    // Save user message
    const userMsgId = uuidv4();
    await db('ai_messages').insert({
      id: userMsgId,
      session_id: session.id,
      role: 'user',
      content: message,
    });

    // Get conversation history
    const history = await db('ai_messages')
      .where({ session_id: session.id })
      .orderBy('created_at', 'asc');

    // TODO: Route to appropriate AI model based on context
    // For now, return a placeholder response
    const assistantMessage = `**AI Tutor**: Great question about "${message.slice(0, 50)}..."\n\nLet me help you understand this concept. Could you tell me what you already know about this topic so I can tailor my explanation to your level?`;

    // Save assistant message
    const assistantMsgId = uuidv4();
    await db('ai_messages').insert({
      id: assistantMsgId,
      session_id: session.id,
      role: 'assistant',
      content: assistantMessage,
    });

    // Update message count
    await db('ai_sessions')
      .where({ id: session.id })
      .update({
        message_count: history.length + 2,
        updated_at: new Date().toISOString(),
      });

    res.json({
      sessionId: session.id,
      message: assistantMessage,
      history: [
        ...history.map((m: any) => ({
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        })),
        { role: 'assistant', content: assistantMessage },
      ],
    });
  } catch (err) {
    console.error('Tutor chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tutor/sessions - List user's chat sessions
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const sessions = await db('ai_sessions')
      .where({ user_id: req.user!.userId })
      .select('id', 'title', 'course_id', 'message_count', 'model_used', 'created_at', 'updated_at')
      .orderBy('updated_at', 'desc')
      .limit(50);

    res.json(sessions.map((s: any) => ({
      id: s.id,
      title: s.title,
      courseId: s.course_id,
      messageCount: s.message_count,
      modelUsed: s.model_used,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })));
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tutor/chat/:sessionId - Get session messages
router.get('/chat/:sessionId', authenticate, async (req: Request, res: Response) => {
  try {
    const session = await db('ai_sessions')
      .where({ id: req.params.sessionId, user_id: req.user!.userId })
      .first();

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const messages = await db('ai_messages')
      .where({ session_id: session.id })
      .orderBy('created_at', 'asc');

    res.json({
      session: {
        id: session.id,
        title: session.title,
        courseId: session.course_id,
        messageCount: session.message_count,
      },
      messages: messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        references: m.references ? JSON.parse(m.references) : null,
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;