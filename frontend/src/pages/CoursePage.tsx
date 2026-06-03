import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ArrowLeft, FileText, Bot, Upload } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  tags: string[];
  updatedAt: string;
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data;
    },
  });

  const { data: notes } = useQuery<Note[]>({
    queryKey: ['notes', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}/notes`);
      return res.data;
    },
  });

  if (!course) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-light-gray rounded w-1/3" />
          <div className="h-4 bg-light-gray rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-up">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-dark-gray hover:text-near-black mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Course Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
            <h1 className="text-3xl font-bold text-near-black">{course.name}</h1>
          </div>
          {course.description && (
            <p className="text-dark-gray">{course.description}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Upload size={16} /> Upload
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Bot size={16} /> AI Tutor
          </button>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <FileText size={20} /> Notes
          </h2>
          <button className="btn-secondary text-sm">+ New Note</button>
        </div>

        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link
                key={note.id}
                to={`/courses/${courseId}/notes`}
                className="card p-5 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-near-black mb-2">{note.title}</h3>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {note.tags.map((tag) => (
                      <span key={tag} className="badge-violet">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <FileText size={48} className="mx-auto text-mid-gray mb-4" />
            <h3 className="text-lg font-semibold text-near-black mb-2">No notes yet</h3>
            <p className="text-dark-gray mb-4">Start taking notes for this course</p>
            <button className="btn-primary">Create Note</button>
          </div>
        )}
      </div>
    </div>
  );
}