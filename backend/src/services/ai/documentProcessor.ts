import fs from 'fs';
import pdf from 'pdf-parse';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProcessedDocument {
  text: string;
  summary: string;
  flashcards: Array<{ question: string; answer: string }>;
  quiz: Array<{ question: string; options: string[]; answer: string }>;
}

export class DocumentProcessor {
  private openai: OpenAI;
  private googleAI: GoogleGenerativeAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  public async processPdf(filePath: string): Promise<ProcessedDocument> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;

      // Generate structured knowledge using LLM
      const summary = await this.generateSummary(text);
      const flashcards = await this.generateFlashcards(text);
      const quiz = await this.generateQuiz(text);

      return {
        text,
        summary,
        flashcards,
        quiz,
      };
    } catch (error) {
      console.error('DocumentProcessor.processPdf error:', error);
      throw new Error('Failed to process document');
    }
  }

  private async generateSummary(text: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate a multi-level summary (TL;DR, Executive Summary, Detailed Outline) for the following text.'
        },
        { role: 'user', content: text.slice(0, 10000) } // Simple slicing for now
      ],
    });
    return response.choices[0].message.content || '';
  }

  private async generateFlashcards(text: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate 5-10 flashcards (question and answer pairs) based on the text. Return as JSON array of objects with "question" and "answer" keys.'
        },
        { role: 'user', content: text.slice(0, 10000) }
      ],
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.flashcards || [];
  }

  private async generateQuiz(text: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate 5 MCQs based on the text. Return as JSON array of objects with "question", "options" (array), and "answer" (string) keys.'
        },
        { role: 'user', content: text.slice(0, 10000) }
      ],
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.quiz || [];
  }
}

export const documentProcessor = new DocumentProcessor();
