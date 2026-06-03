import { Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PlannerPage() {
  return (
    <div className="page-container animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-near-black">Study Planner</h1>
          <p className="text-dark-gray mt-1">AI-optimized study schedule</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Sparkles size={16} /> Generate Plan
        </button>
      </div>

      {/* Week Navigation */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <button className="btn-ghost">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-near-black">This Week</span>
        <button className="btn-ghost">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Columns */}
      <div className="grid grid-cols-7 gap-3">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="card p-3 min-h-[200px]">
            <p className="text-sm font-medium text-dark-gray mb-2">{day}</p>
            <div className="space-y-2">
              {/* Placeholder tasks */}
              <div className="p-2 rounded-lg bg-vibrant-violet/5 border border-vibrant-violet/20">
                <p className="text-xs font-medium text-near-black">Review Notes</p>
                <p className="text-xs text-dark-gray">45 min</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}