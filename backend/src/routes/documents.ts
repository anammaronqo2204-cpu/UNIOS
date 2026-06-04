import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import multer from 'multer';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { config } from '../config';
import { documentProcessor } from '../services/ai/documentProcessor';

const router = Router({ mergeParams: true });

// File upload configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Document type mapping
function getDocType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('text') || mimeType.includes('markdown')) return 'text';
  return 'other';
}

// POST /courses/:courseId/documents - Upload document
router.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Verify course ownership
      const course = await db('courses')
        .where({ id: req.params.courseId, user_id: req.user!.userId })
        .first();

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const id = uuidv4();
      const docType = getDocType(req.file.mimetype);

      await db('documents').insert({
        id,
        user_id: req.user!.userId,
        course_id: req.params.courseId,
        type: docType,
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        status: 'processing',
      });

      const doc = await db('documents').where({ id }).first();

      // Trigger async processing
      if (docType === 'pdf') {
        documentProcessor.processPdf(req.file.path).then(async (result) => {
          try {
            // Update document
            await db('documents').where({ id }).update({
              content_text: result.text,
              status: 'ready',
              metadata: JSON.stringify({ summary: result.summary }),
            });

            // Insert flashcards
            if (result.flashcards && result.flashcards.length > 0) {
              const flashcardsToInsert = result.flashcards.map(f => ({
                id: uuidv4(),
                user_id: req.user!.userId,
                course_id: req.params.courseId,
                question: f.question,
                answer: f.answer,
              }));
              await db('flashcards').insert(flashcardsToInsert);
            }

            // Insert quiz as an exam
            if (result.quiz && result.quiz.length > 0) {
              await db('exams').insert({
                id: uuidv4(),
                user_id: req.user!.userId,
                course_id: req.params.courseId,
                title: `Quiz: ${req.file!.originalname}`,
                questions_json: JSON.stringify(result.quiz),
                status: 'pending',
              });
            }
          } catch (error) {
            console.error(`Error background processing document ${id}:`, error);
            await db('documents').where({ id }).update({ status: 'error' });
          }
        }).catch(async (error) => {
          console.error(`Background processing failed for document ${id}:`, error);
          await db('documents').where({ id }).update({ status: 'error' });
        });
      } else {
        // For non-PDF types, mark as ready for now (placeholder)
        await db('documents').where({ id }).update({ status: 'ready' });
      }

      res.status(201).json({
        id: doc.id,
        type: doc.type,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        status: doc.status,
        createdAt: doc.created_at,
      });
    } catch (err: any) {
      if (err.message?.includes('File type')) {
        res.status(400).json({ error: err.message });
        return;
      }
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /courses/:courseId/documents - List documents
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const docs = await db('documents')
      .where({ user_id: req.user!.userId, course_id: req.params.courseId })
      .select('id', 'type', 'file_name', 'file_size', 'status', 'created_at')
      .orderBy('created_at', 'desc');

    res.json(docs.map((d: any) => ({
      id: d.id,
      type: d.type,
      fileName: d.file_name,
      fileSize: d.file_size,
      status: d.status,
      createdAt: d.created_at,
    })));
  } catch (err) {
    console.error('List documents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /documents/:docId - Get document details/status
router.get('/:docId', authenticate, async (req: Request, res: Response) => {
  try {
    const doc = await db('documents')
      .where({ id: req.params.docId, user_id: req.user!.userId })
      .first();

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json({
      id: doc.id,
      type: doc.type,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      status: doc.status,
      summary: doc.metadata ? JSON.parse(doc.metadata).summary : null,
      createdAt: doc.created_at,
    });
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /documents/:id - Delete document
router.delete('/:docId', authenticate, async (req: Request, res: Response) => {
  try {
    const doc = await db('documents')
      .where({ id: req.params.docId, user_id: req.user!.userId })
      .first();

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Delete file from disk
    const fs = await import('fs/promises');
    try {
      await fs.unlink(doc.file_path);
    } catch {
      // File may not exist, continue
    }

    await db('documents').where({ id: req.params.docId }).del();

    res.status(204).send();
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;