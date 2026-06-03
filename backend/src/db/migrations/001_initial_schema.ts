import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable WAL mode for better concurrent performance
  await knex.raw('PRAGMA journal_mode = WAL');
  await knex.raw('PRAGMA foreign_keys = ON');

  // ----- Users Table -----
  await knex.schema.createTable('users', (table) => {
    table.text('id').primary(); // UUID
    table.text('email').unique().notNullable();
    table.text('name').notNullable();
    table.text('password_hash').notNullable();
    table.text('plan_tier').notNullable().defaultTo('free'); // 'free' | 'premium' | 'institutional'
    table.text('avatar_url');
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
    table.text('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Courses Table -----
  await knex.schema.createTable('courses', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('description');
    table.text('color').defaultTo('#7C3AED');
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
    table.text('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Notes Table -----
  await knex.schema.createTable('notes', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.text('title').notNullable().defaultTo('Untitled Note');
    table.text('content'); // JSON - rich text content
    table.text('ai_summary'); // AI-generated summary
    table.integer('is_pinned').defaultTo(0);
    table.text('tags'); // JSON array
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
    table.text('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Documents Table (Uploaded Study Materials) -----
  await knex.schema.createTable('documents', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.text('type').notNullable(); // 'pdf' | 'image' | 'audio' | 'text' | 'voice_note'
    table.text('file_name').notNullable();
    table.text('file_path').notNullable();
    table.integer('file_size');
    table.text('content_text'); // Extracted/transcribed text
    table.text('status').notNullable().defaultTo('processing'); // 'processing' | 'ready' | 'error'
    table.text('metadata'); // JSON: page_count, duration, etc.
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- AI Chat Sessions -----
  await knex.schema.createTable('ai_sessions', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').references('id').inTable('courses').onDelete('SET NULL');
    table.text('title').defaultTo('New Study Session');
    table.text('model_used');
    table.integer('message_count').defaultTo(0);
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
    table.text('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- AI Chat Messages -----
  await knex.schema.createTable('ai_messages', (table) => {
    table.text('id').primary();
    table.text('session_id').notNullable().references('id').inTable('ai_sessions').onDelete('CASCADE');
    table.text('role').notNullable(); // 'user' | 'assistant' | 'system'
    table.text('content').notNullable();
    table.text('references'); // JSON: cited document references
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Study Plans -----
  await knex.schema.createTable('study_plans', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('schedule_json'); // JSON: daily/weekly schedule
    table.integer('is_active').defaultTo(1);
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Study Tasks -----
  await knex.schema.createTable('study_tasks', (table) => {
    table.text('id').primary();
    table.text('plan_id').notNullable().references('id').inTable('study_plans').onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('description');
    table.text('due_date');
    table.integer('duration_min');
    table.text('status').defaultTo('pending');
    table.integer('priority').defaultTo(1);
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Flashcards -----
  await knex.schema.createTable('flashcards', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.text('question').notNullable();
    table.text('answer').notNullable();
    table.integer('confidence').defaultTo(0);
    table.float('interval_days').defaultTo(0);
    table.float('ease_factor').defaultTo(2.5);
    table.text('next_review');
    table.text('reviewed_at');
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Exams / Quizzes -----
  await knex.schema.createTable('exams', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('questions_json').notNullable();
    table.text('answers_json');
    table.float('score');
    table.text('weakness_json');
    table.integer('duration_min');
    table.integer('time_taken_sec');
    table.text('status').defaultTo('pending'); // 'pending' | 'completed' | 'reviewed'
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
    table.text('completed_at');
  });

  // ----- Lecture Recordings -----
  await knex.schema.createTable('recordings', (table) => {
    table.text('id').primary();
    table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.text('file_path').notNullable();
    table.integer('duration_sec');
    table.text('transcription');
    table.text('summary');
    table.text('chapters_json');
    table.text('status').defaultTo('processing');
    table.text('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ----- Indexes -----
  await knex.raw('CREATE INDEX idx_courses_user ON courses(user_id)');
  await knex.raw('CREATE INDEX idx_notes_course ON notes(course_id)');
  await knex.raw('CREATE INDEX idx_documents_course ON documents(course_id)');
  await knex.raw('CREATE INDEX idx_documents_user ON documents(user_id)');
  await knex.raw('CREATE INDEX idx_flashcards_course ON flashcards(course_id)');
  await knex.raw('CREATE INDEX idx_flashcards_review ON flashcards(next_review)');
  await knex.raw('CREATE INDEX idx_exams_course ON exams(course_id)');
  await knex.raw('CREATE INDEX idx_exams_user ON exams(user_id)');
  await knex.raw('CREATE INDEX idx_study_tasks_plan ON study_tasks(plan_id)');
  await knex.raw('CREATE INDEX idx_study_tasks_due ON study_tasks(due_date)');
  await knex.raw('CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id)');
  await knex.raw('CREATE INDEX idx_ai_messages_session ON ai_messages(session_id)');
  await knex.raw('CREATE INDEX idx_recordings_course ON recordings(course_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('recordings');
  await knex.schema.dropTableIfExists('ai_messages');
  await knex.schema.dropTableIfExists('ai_sessions');
  await knex.schema.dropTableIfExists('study_tasks');
  await knex.schema.dropTableIfExists('study_plans');
  await knex.schema.dropTableIfExists('flashcards');
  await knex.schema.dropTableIfExists('exams');
  await knex.schema.dropTableIfExists('documents');
  await knex.schema.dropTableIfExists('notes');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('users');
}