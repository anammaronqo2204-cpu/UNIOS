import { useState } from 'react';
import { Calendar, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export default function PlannerPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: activePlan, refetch } = useQuery({
    queryKey: ['activePlan'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/planner/active');
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const course = courses?.find((c: any) => c.id === courseId);
      const res = await apiClient.post('/planner/generate', {
        courseId,
        title: `Plan for ${course?.name}`,
        examDates: [
          { subject: course?.name, date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        ],
        studyHoursPerDay: 2,
      });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      setIsGenerating(false);
    },
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Helper to group tasks by day of week (very simplified)
  const getTasksForDay = (dayIndex: number) => {
    if (!activePlan) return [];
    return activePlan.tasks.filter((t: any) => {
      const date = new Date(t.dueDate);
      const day = (date.getDay() + 6) % 7; // Mon is 0
      return day === dayIndex;
    });
  };

  return (
    <div className="page-container animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-near-black">Study Planner</h1>
          <p className="text-dark-gray mt-1">AI-optimized study schedule</p>
        </div>
        
        <div className="flex gap-2">
          {courses && courses.length > 0 && (
            <button 
              onClick={() => {
                setIsGenerating(true);
                generateMutation.mutate(courses[0].id);
              }}
              disabled={generateMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate Plan
            </button>
          )}
        </div>
      </div>

      {!activePlan && !generateMutation.isPending && (
        <div className="card p-12 text-center">
          <Calendar size={48} className="mx-auto text-mid-gray mb-4" />
          <h3 className="text-lg font-semibold text-near-black mb-2">No active study plan</h3>
          <p className="text-dark-gray mb-4">Generate a plan to see your schedule here</p>
        </div>
      )}

      {/* Week Navigation */}
      {activePlan && (
        <>
          <div className="card p-4 mb-6 flex items-center justify-between">
            <button className="btn-ghost">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-near-black">{activePlan.title}</span>
            <button className="btn-ghost">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Columns */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {days.map((day, i) => (
              <div key={day} className="card p-3 min-h-[200px]">
                <p className="text-sm font-medium text-dark-gray mb-2">{day}</p>
                <div className="space-y-2">
                  {getTasksForDay(i).map((task: any) => (
                    <div key={task.id} className="p-2 rounded-lg bg-vibrant-violet/5 border border-vibrant-violet/20">
                      <p className="text-xs font-medium text-near-black">{task.title}</p>
                      <p className="text-xs text-dark-gray">{task.durationMin} min</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
