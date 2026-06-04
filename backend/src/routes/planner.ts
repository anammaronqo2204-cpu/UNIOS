import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { plannerService } from '../services/ai/plannerService';

const router = Router();

const planSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1),
  examDates: z.array(z.object({
    subject: z.string(),
    date: z.string(),
  })),
  studyHoursPerDay: z.number().min(1).max(24),
});

// POST /planner/generate - Generate a new study plan
router.post('/generate', authenticate, validate(planSchema), async (req: Request, res: Response) => {
  try {
    const { courseId, title, examDates, studyHoursPerDay } = req.body;

    // Get course materials
    const documents = await db('documents')
      .where({ course_id: courseId, user_id: req.user!.userId })
      .select('file_name');

    const materials = documents.map(d => ({ subject: title, title: d.file_name }));

    const schedule = await plannerService.generateStudyPlan({
      examDates,
      materials,
      studyHoursPerDay,
    });

    const planId = uuidv4();
    await db('study_plans').insert({
      id: planId,
      user_id: req.user!.userId,
      course_id: courseId,
      title,
      schedule_json: JSON.stringify(schedule),
      is_active: 1,
    });

    // Insert tasks
    for (const day of schedule) {
      for (const task of day.tasks) {
        await db('study_tasks').insert({
          id: uuidv4(),
          plan_id: planId,
          title: task.title,
          due_date: day.date,
          duration_min: task.duration_min,
          priority: task.priority,
          status: 'pending',
        });
      }
    }

    res.status(201).json({
      id: planId,
      title,
      schedule,
    });
  } catch (err) {
    console.error('Generate plan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /planner/active - Get the active study plan
router.get('/active', authenticate, async (req: Request, res: Response) => {
  try {
    const plan = await db('study_plans')
      .where({ user_id: req.user!.userId, is_active: 1 })
      .first();

    if (!plan) {
      res.status(404).json({ error: 'No active study plan found' });
      return;
    }

    const tasks = await db('study_tasks')
      .where({ plan_id: plan.id })
      .orderBy('due_date', 'asc');

    res.json({
      id: plan.id,
      title: plan.title,
      courseId: plan.course_id,
      schedule: JSON.parse(plan.schedule_json),
      tasks: tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        durationMin: t.duration_min,
        status: t.status,
        priority: t.priority,
      })),
    });
  } catch (err) {
    console.error('Get active plan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
