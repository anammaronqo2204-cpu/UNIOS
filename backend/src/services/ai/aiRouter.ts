import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Using standard OpenAI SDK patterns and others as requested.
// We will define a standard interface for our AI responses.

export enum AIModelType {
  FAST = 'fast',
  DEEP = 'deep',
  LONG_CONTEXT = 'long_context'
}

export interface AIConfig {
  modelType: AIModelType;
  stream?: boolean;
}

export class AIRouter {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private googleAI: GoogleGenerativeAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  /**
   * Route to the appropriate model based on the request characteristics
   */
  public async route(prompt: string, contextLength: number = 0): Promise<AIModelType> {
    // 1. Context Check: If > 100k tokens (approx), use Gemini 1.5 Pro
    if (contextLength > 100000) {
      return AIModelType.LONG_CONTEXT;
    }

    // 2. Intention Detection (Simple heuristic for now, can be a small model call)
    // If prompt is short and looks like a simple question
    if (prompt.length < 200 && !prompt.toLowerCase().includes('explain') && !prompt.toLowerCase().includes('analyze')) {
      return AIModelType.FAST;
    }

    // Default to Deep reasoning for tutoring
    return AIModelType.DEEP;
  }

  public getModel(type: AIModelType) {
    switch (type) {
      case AIModelType.FAST:
        return {
          provider: 'openai',
          model: 'gpt-4o-mini'
        };
      case AIModelType.LONG_CONTEXT:
        return {
          provider: 'google',
          model: 'gemini-1.5-pro'
        };
      case AIModelType.DEEP:
      default:
        return {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20240620'
        };
    }
  }
}

export const aiRouter = new AIRouter();
