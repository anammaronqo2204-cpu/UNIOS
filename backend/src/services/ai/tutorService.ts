import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiRouter, AIModelType } from './aiRouter';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class TutorService {
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

  private getSystemPrompt(): string {
    return `You are the UniOS AI Tutor. Your goal is to guide students to understanding, not just provide answers.
Use the Socratic Method: Ask leading questions. If a student is stuck, provide a hint rather than the full solution.
Progression Logic:
1. Concept Introduction: Explain using the "ELI5" (Explain Like I'm 5) principle first if it's a new concept.
2. Analogy: Use a relatable real-world analogy.
3. Active Recall: Ask the student to explain the concept back in their own words.
4. Scaffolding: Gradually increase difficulty as the student shows mastery.
Keep your tone encouraging and academic.`;
  }

  public async chat(messages: ChatMessage[], contextLength: number = 0) {
    try {
      const lastMessage = messages[messages.length - 1].content;
      const modelType = await aiRouter.route(lastMessage, contextLength);
      const modelInfo = aiRouter.getModel(modelType);

      if (modelInfo.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: modelInfo.model,
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            ...messages
          ],
        });
        return response.choices[0].message.content;
      } else if (modelInfo.provider === 'anthropic') {
        const response = await this.anthropic.messages.create({
          model: modelInfo.model,
          max_tokens: 4096,
          system: this.getSystemPrompt(),
          messages: messages.filter(m => m.role !== 'system') as any,
        });
        return response.content[0].type === 'text' ? response.content[0].text : '';
      } else if (modelInfo.provider === 'google') {
        const model = this.googleAI.getGenerativeModel({ model: modelInfo.model });
        const chat = model.startChat({
          history: messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: 4096,
          },
        });
        const result = await chat.sendMessage(lastMessage);
        return result.response.text();
      }

      throw new Error('Unsupported provider');
    } catch (error) {
      console.error('TutorService.chat error:', error);
      throw new Error('Failed to get response from AI Tutor');
    }
  }

  public async chatStream(messages: ChatMessage[], onToken: (token: string) => void) {
    // Simplified streaming logic for tutor responses
    // For now, let's use OpenAI for streaming as it's the easiest to implement quickly
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        ...messages
      ],
      stream: true,
    });

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onToken(content);
      }
    }
  }
}

export const tutorService = new TutorService();
