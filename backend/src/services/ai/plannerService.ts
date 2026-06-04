import { OpenAI } from 'openai';

export interface PlannerInput {
  examDates: Array<{ subject: string; date: string }>;
  materials: Array<{ subject: string; title: string }>;
  studyHoursPerDay: number;
}

export class PlannerService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generateStudyPlan(input: PlannerInput) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert AI Study Planner. Your goal is to create a realistic, day-by-day study schedule.
Take into account the exam dates, available course materials, and study hours per day.
Return the schedule as a JSON array of objects, where each object represents a day:
{ "date": "YYYY-MM-DD", "tasks": [ { "title": string, "duration_min": number, "priority": number } ] }`
        },
        {
          role: 'user',
          content: `Generate a study plan based on:
Exam Dates: ${JSON.stringify(input.examDates)}
Materials: ${JSON.stringify(input.materials)}
Study Hours/Day: ${input.studyHoursPerDay}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.schedule || [];
  }
}

export const plannerService = new PlannerService();
