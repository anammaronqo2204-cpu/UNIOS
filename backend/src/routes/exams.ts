import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { examGenerator } from '../services/ai/examGenerator';

const router = Router();

const generateExamSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1),
  subject: z.string(),
});

// POST /exams/generate - Generate a new exam
router.post('/generate', authenticate, validate(generateExamSchema), async (req: Request, res: Response) => {
  try {
    const { courseId, title, subject } = req.body;

    // Get course materials text
    const documents = await db('documents')
      .where({ course_id: courseId, user_id: req.user!.userId })
      .select('content_text');

    const materialText = documents.map(d => d.content_text).join('\n\n');

    if (!materialText || materialText.trim().length < 100) {
      res.status(400).json({ error: 'Not enough course material to generate an exam' });
      return;
    }

    const questions = await examGenerator.generateExam(subject, materialText);

    const examId = uuidv4();
    await db('exams').insert({
      id: examId,
      user_id: req.user!.userId,
      course_id: courseId,
      title,
      questions_json: JSON.stringify(questions),
      status: 'pending',
    });

    res.status(201).json({
      id: examId,
      title,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        points: q.points,
      })),
    });
  } catch (err) {
    console.error('Generate exam error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /exams/:examId/submit - Submit exam answers and get grading
router.post('/:examId/submit', authenticate, async (req: Request, res: Response) => {
  try {
    const { answers } = req.body; // Map of questionId -> answer
    const examId = req.params.examId;

    const exam = await db('exams')
      .where({ id: examId, user_id: req.user!.userId })
      .first();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const questions = JSON.parse(exam.questions_json);
    const results = [];
    let totalScore = 0;
    let maxPoints = 0;

    for (const q of questions) {
      const studentAnswer = answers[q.id] || '';
      const grading = await examGenerator.gradeAnswer(q, studentAnswer);
      results.push({
        questionId: q.id,
        score: grading.score,
        feedback: grading.feedback,
      });
      totalScore += grading.score;
      maxPoints += q.points;
    }

    const weaknessJson = results.filter(r => r.score < 5).map(r => r.feedback);

    await db('exams').where({ id: examId }).update({
      answers_json: JSON.stringify(answers),
      score: totalScore,
      status: 'completed',
      completed_at: new Date().toISOString(),
      weakness_json: JSON.stringify(weaknessJson),
    });

    res.json({
      score: totalScore,
      maxPoints,
      percentage: (totalScore / maxPoints) * 100,
      results,
      weaknesses: weaknessJson,
    });
  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
