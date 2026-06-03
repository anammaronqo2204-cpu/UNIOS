import { Lightbulb, Sparkles, RotateCcw } from 'lucide-react';

export default function FlashcardsPage() {
  return (
    <div className="page-container animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-near-black">Flashcards</h1>
          <p className="text-dark-gray mt-1">Spaced repetition for effective learning</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Sparkles size={16} /> Generate Flashcards
        </button>
      </div>

      {/* Flashcard */}
      <div className="max-w-lg mx-auto">
        <div className="card p-12 text-center cursor-pointer hover:shadow-lg transition-all min-h-[300px] flex flex-col items-center justify-center">
          <Lightbulb size={48} className="text-vibrant-violet mb-4" />
          <p className="text-dark-gray mb-4">Tap to reveal the answer</p>
          <p className="text-2xl font-bold text-near-black">What is the powerhouse of the cell?</p>

          <div className="mt-8 flex items-center gap-4">
            <button className="btn-ghost flex items-center gap-2">
              <RotateCcw size={16} /> Flip
            </button>
          </div>
        </div>

        {/* Review buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <button className="btn-secondary px-8">Again</button>
          <button className="btn-secondary px-8">Good</button>
          <button className="btn-primary px-8">Easy</button>
        </div>

        <p className="text-center text-sm text-dark-gray mt-4">
          2 cards due for review
        </p>
      </div>
    </div>
  );
}