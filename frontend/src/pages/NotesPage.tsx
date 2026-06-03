import { useParams } from 'react-router-dom';
import { PenLine, Sparkles } from 'lucide-react';

export default function NotesPage() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-light-gray bg-white px-6 py-3 flex items-center justify-between">
        <input
          type="text"
          defaultValue="Untitled Note"
          className="text-lg font-semibold text-near-black bg-transparent border-none focus:outline-none w-64"
        />
        <div className="flex items-center gap-2">
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-vibrant-violet" />
            AI Enhance
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="text-dark-gray text-center mt-20">
            <PenLine size={48} className="mx-auto text-mid-gray mb-4" />
            <p className="text-lg">Start writing your notes here...</p>
            <p className="text-sm mt-2">Use AI to summarize, expand, or generate flashcards</p>
          </div>
        </div>
      </div>
    </div>
  );
}