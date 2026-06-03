// Shared TypeScript types for UniOS frontend and backend

// ----- Users -----
export interface User {
  id: string;
  email: string;
  name: string;
  planTier: 'free' | 'premium' | 'institutional';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ----- Courses -----
export interface Course {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
  color?: string;
}

// ----- Notes -----
export interface Note {
  id: string;
  courseId: string;
  title: string;
  content?: any; // Rich text JSON
  aiSummary?: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ----- Documents -----
export type DocumentType = 'pdf' | 'image' | 'audio' | 'text' | 'voice_note';
export type DocumentStatus = 'processing' | 'ready' | 'error';

export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  createdAt: string;
}

// ----- AI Tutor -----
export interface AISession {
  id: string;
  title: string;
  courseId?: string;
  messageCount: number;
  modelUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  references?: DocumentReference[];
  createdAt: string;
}

export interface DocumentReference {
  documentId: string;
  fileName: string;
  page?: number;
  timestamp?: number;
}

// ----- Study Planner -----
export interface StudyPlan {
  id: string;
  courseId: string;
  title: string;
  schedule: WeeklySchedule[];
  isActive: boolean;
  createdAt: string;
}

export interface WeeklySchedule {
  week: number;
  focus: string;
  tasks?: StudyTask[];
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  durationMin: number;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
}

// ----- Flashcards -----
export interface Flashcard {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  confidence: number; // 0-5
  intervalDays: number;
  easeFactor: number;
  nextReview?: string;
  reviewedAt?: string;
  createdAt: string;
}

// ----- Exams -----
export type ExamStatus = 'pending' | 'completed' | 'reviewed';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ
  correctAnswer?: string;
  points: number;
}

export interface ExamResult {
  examId: string;
  title: string;
  score: number;
  totalPoints: number;
  percentage: number;
  weaknesses: string[];
  timeTakenSec: number;
  completedAt: string;
}

// ----- API Response Wrapper -----
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}