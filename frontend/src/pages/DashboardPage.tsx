import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Bot, Calendar, FileQuestion, ArrowRight } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    },
  });

  const stats = [
    { label: 'Courses', value: courses?.length || 0, icon: BookOpen, color: 'text-vibrant-violet', bg: 'bg-vibrant-violet/10' },
    { label: 'AI Sessions', value: '—', icon: Bot, color: 'text-electric-blue', bg: 'bg-electric-blue/10' },
    { label: 'Study Tasks', value: '—', icon: Calendar, color: 'text-study-green', bg: 'bg-study-green/10' },
    { label: 'Exams', value: '—', icon: FileQuestion, color: 'text-alert-amber', bg: 'bg-alert-amber/10' },
  ];

  return (
    <div className="page-container animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-near-black">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-dark-gray mt-1">Here's your learning overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-near-black">{stat.value}</p>
            <p className="text-sm text-dark-gray">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/tutor" className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-vibrant-violet to-electric-blue flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-near-black">AI Tutor</p>
            <p className="text-sm text-dark-gray">Ask anything about your courses</p>
          </div>
          <ArrowRight size={20} className="text-mid-gray group-hover:text-vibrant-violet transition-colors" />
        </Link>

        <Link to="/planner" className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-lg bg-study-green/10 flex items-center justify-center">
            <Calendar size={24} className="text-study-green" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-near-black">Study Planner</p>
            <p className="text-sm text-dark-gray">Organize your study schedule</p>
          </div>
          <ArrowRight size={20} className="text-mid-gray group-hover:text-study-green transition-colors" />
        </Link>

        <Link to="/exams" className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-lg bg-alert-amber/10 flex items-center justify-center">
            <FileQuestion size={24} className="text-alert-amber" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-near-black">Exam Mode</p>
            <p className="text-sm text-dark-gray">Test your knowledge</p>
          </div>
          <ArrowRight size={20} className="text-mid-gray group-hover:text-alert-amber transition-colors" />
        </Link>
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Your Courses</h2>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Course
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-light-gray rounded w-3/4 mb-3" />
                <div className="h-3 bg-light-gray rounded w-full" />
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <h3 className="font-semibold text-near-black">{course.name}</h3>
                </div>
                {course.description && (
                  <p className="text-sm text-dark-gray line-clamp-2">{course.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <BookOpen size={48} className="mx-auto text-mid-gray mb-4" />
            <h3 className="text-lg font-semibold text-near-black mb-2">No courses yet</h3>
            <p className="text-dark-gray mb-4">Add your first course to get started</p>
            <button className="btn-primary">Add Course</button>
          </div>
        )}
      </div>
    </div>
  );
}