import { useState } from 'react';
import { FileQuestion, Sparkles, Clock, BarChart3, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

interface Course {
  id: string;
  name: string;
}

export default function ExamPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [exam, setExam] = useState<any>(null);

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const course = courses?.find(c => c.id === courseId);
      const res = await apiClient.post('/exams/generate', {
        courseId,
        title: `Practice Exam: ${new Date().toLocaleDateString()}`,
        subject: course?.name || 'General Study',
      });
      return res.data;
    },
    onSuccess: (data) => {
      setExam(data);
    },
  });

  const stats = [
    { label: 'Exams Taken', value: '0', icon: FileQuestion, color: 'text-vibrant-violet' },
    { label: 'Avg. Score', value: '—', icon: BarChart3, color: 'text-study-green' },
    { label: 'Time Spent', value: '0 min', icon: Clock, color: 'text-electric-blue' },
  ];

  if (exam) {
    return (
      <div className="page-container">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-near-black">{exam.title}</h1>
            <p className="text-dark-gray mt-1">{exam.questions.length} Questions</p>
          </div>
          <button onClick={() => setExam(null)} className="btn-secondary">Cancel</button>
        </div>
        
        <div className="space-y-6">
          {exam.questions.map((q: any, i: number) => (
            <div key={q.id} className="card p-6">
              <p className="font-semibold mb-4">Question {i + 1}: {q.question}</p>
              {q.type === 'mcq' && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt: string, j: number) => (
                    <label key={j} className="flex items-center gap-3 p-3 rounded-lg border border-light-gray hover:bg-off-white cursor-pointer">
                      <input type="radio" name={q.id} className="text-vibrant-violet focus:ring-vibrant-violet" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type !== 'mcq' && (
                <textarea className="input-field" rows={3} placeholder="Type your answer here..." />
              )}
            </div>
          ))}
          <button className="btn-primary w-full">Submit Exam</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-near-black">Exam Mode</h1>
        <p className="text-dark-gray mt-1">Generate practice exams from your materials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <stat.icon size={20} className={stat.color} />
            <p className="text-2xl font-bold text-near-black mt-2">{stat.value}</p>
            <p className="text-sm text-dark-gray">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Generate Exam */}
      <div className="card p-8 text-center">
        <FileQuestion size={48} className="mx-auto text-mid-gray mb-4" />
        <h2 className="text-xl font-bold text-near-black mb-2">Generate a Practice Exam</h2>
        <p className="text-dark-gray mb-6 max-w-md mx-auto">
          Create a customized exam from your notes and uploaded materials.
        </p>
        
        <div className="max-w-xs mx-auto space-y-4">
          <select 
            className="input-field"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">Select a course...</option>
            {courses?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button 
            onClick={() => generateMutation.mutate(selectedCourseId)}
            disabled={!selectedCourseId || generateMutation.isPending}
            className="btn-primary flex items-center gap-2 mx-auto w-full justify-center"
          >
            {generateMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Generate Exam
          </button>
        </div>
      </div>
    </div>
  );
}
