import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data
  await knex('recordings').del();
  await knex('ai_messages').del();
  await knex('ai_sessions').del();
  await knex('study_tasks').del();
  await knex('study_plans').del();
  await knex('flashcards').del();
  await knex('exams').del();
  await knex('documents').del();
  await knex('notes').del();
  await knex('courses').del();
  await knex('users').del();

  // Seed users
  const passwordHash = await bcrypt.hash('password123', 12);
  const userId = uuidv4();

  await knex('users').insert({
    id: userId,
    email: 'demo@unios.app',
    name: 'Demo Student',
    password_hash: passwordHash,
    plan_tier: 'premium',
  });

  // Seed courses
  const course1Id = uuidv4();
  const course2Id = uuidv4();

  await knex('courses').insert([
    {
      id: course1Id,
      user_id: userId,
      name: 'Introduction to Biology',
      description: 'Cell biology, genetics, and evolution fundamentals.',
      color: '#10B981',
    },
    {
      id: course2Id,
      user_id: userId,
      name: 'Calculus I',
      description: 'Limits, derivatives, and integrals.',
      color: '#3B82F6',
    },
  ]);

  // Seed notes
  await knex('notes').insert([
    {
      id: uuidv4(),
      user_id: userId,
      course_id: course1Id,
      title: 'Cell Structure Notes',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', content: [{ type: 'text', text: 'Cell Theory' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'All living organisms are composed of cells. Cells are the basic unit of life. All cells arise from pre-existing cells.' }] },
        ],
      }),
      tags: JSON.stringify(['biology', 'cells', 'fundamentals']),
    },
    {
      id: uuidv4(),
      user_id: userId,
      course_id: course2Id,
      title: 'Derivative Rules',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', content: [{ type: 'text', text: 'Basic Derivative Rules' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Power rule: d/dx(x^n) = nx^(n-1). Sum rule: d/dx(f + g) = f\' + g\'. Product rule: (fg)\' = f\'g + fg\'.' }] },
        ],
      }),
      tags: JSON.stringify(['calculus', 'derivatives', 'math']),
    },
  ]);

  // Seed flashcards
  await knex('flashcards').insert([
    {
      id: uuidv4(),
      user_id: userId,
      course_id: course1Id,
      question: 'What are the three parts of cell theory?',
      answer: '1. All living things are composed of cells\n2. Cells are the basic unit of life\n3. All cells arise from pre-existing cells',
      confidence: 3,
      ease_factor: 2.5,
      interval_days: 3,
    },
    {
      id: uuidv4(),
      user_id: userId,
      course_id: course2Id,
      question: 'What is the power rule for differentiation?',
      answer: 'd/dx(x^n) = n × x^(n-1)',
      confidence: 4,
      ease_factor: 2.5,
      interval_days: 7,
    },
  ]);

  // Seed study plan
  const planId = uuidv4();
  await knex('study_plans').insert({
    id: planId,
    user_id: userId,
    course_id: course1Id,
    title: 'Biology Midterm Prep',
    schedule_json: JSON.stringify({
      weeks: [
        { week: 1, focus: 'Cell Biology' },
        { week: 2, focus: 'Genetics' },
      ],
    }),
    is_active: 1,
  });

  await knex('study_tasks').insert([
    {
      id: uuidv4(),
      plan_id: planId,
      title: 'Review cell organelles',
      description: 'Read chapter 3 and make flashcards',
      duration_min: 45,
      priority: 1,
      status: 'pending',
    },
    {
      id: uuidv4(),
      plan_id: planId,
      title: 'Practice DNA replication diagram',
      description: 'Draw and label the replication fork',
      duration_min: 30,
      priority: 2,
      status: 'pending',
    },
  ]);

  console.log('✅ Seed data inserted successfully');
}