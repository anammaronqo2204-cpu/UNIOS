import { FileQuestion, Sparkles, Clock, BarChart3 } from 'lucide-react';

export default function ExamPage() {
  const stats = [
    { label: 'Exams Taken', value: '0', icon: FileQuestion, color: 'text-vibrant-violet' },
    { label: 'Avg. Score', value: '—', icon: BarChart3, color: 'text-study-green' },
    { label: 'Time Spent', value: '0 min', icon: Clock, color: 'text-electric-blue' },
  ];

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
          Create a customized exam from your notes and uploaded materials. Choose your format, difficulty, and topics.
        </p>
        <button className="btn-primary flex items-center gap-2 mx-auto">
          <Sparkles size={16} /> Generate Exam
        </button>
      </div>
    </div>
  );
}