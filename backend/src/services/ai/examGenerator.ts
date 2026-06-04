import { OpenAI } from 'openai';

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

export class ExamGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generateExam(subject: string, material: string, count: number = 10): Promise<ExamQuestion[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Generate an exam based on Bloom's Taxonomy. Include a mix of:
- Remembering (Knowledge retrieval)
- Understanding (Explaining concepts)
- Applying (Using info in new situations)
- Analyzing (Drawing connections)
Return as JSON array of objects with "id", "type", "question", "options" (if MCQ), "correctAnswer", and "points" (1-10 depending on difficulty).`
          },
          { role: 'user', content: `Subject: ${subject}\nMaterial: ${material.slice(0, 5000)}` }
        ],
        response_format: { type: 'json_object' }
      });
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.questions || [];
    } catch (error) {
      console.error('ExamGenerator.generateExam error:', error);
      throw new Error('Failed to generate exam');
    }
  }

  public async gradeAnswer(question: ExamQuestion, studentAnswer: string): Promise<{ score: number; feedback: string }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert examiner. Grade the student's answer based on the provided question and correct answer.
Use Rubric-based marking. Provide a numerical score (0 to ${question.points}) and specific feedback on why points were lost or gained.
Return JSON: { "score": number, "feedback": string }`
          },
          {
            role: 'user',
            content: `Question: ${question.question}\nCorrect Answer: ${question.correctAnswer}\nStudent Answer: ${studentAnswer}`
          }
        ],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ExamGenerator.gradeAnswer error:', error);
      throw new Error('Failed to grade answer');
    }
  }
}

export const examGenerator = new ExamGenerator();
