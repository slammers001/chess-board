import { useState } from 'react';

interface ColorSelectionDialogProps {
  onSelect: (color: 'white' | 'black' | 'random') => void;
  onCancel: () => void;
}

export function ColorSelectionDialog({ onSelect, onCancel }: ColorSelectionDialogProps) {
  const [hoveredColor, setHoveredColor] = useState<'white' | 'black' | 'random' | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Play vs Bot</h2>
        <p className="text-gray-500 text-center mb-8">Choose your color</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => onSelect('white')}
            onMouseEnter={() => setHoveredColor('white')}
            onMouseLeave={() => setHoveredColor(null)}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
              hoveredColor === 'white'
                ? 'border-amber-400 bg-amber-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white to-gray-200 border-2 border-gray-300 flex items-center justify-center shadow-inner">
              <span className="text-2xl">♔</span>
            </div>
            <span className="font-semibold text-gray-700 text-sm">White</span>
          </button>

          <button
            onClick={() => onSelect('random')}
            onMouseEnter={() => setHoveredColor('random')}
            onMouseLeave={() => setHoveredColor(null)}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
              hoveredColor === 'random'
                ? 'border-emerald-400 bg-emerald-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-400 border-2 border-gray-300 flex items-center justify-center shadow-inner">
              <span className="text-2xl">🎲</span>
            </div>
            <span className="font-semibold text-gray-700 text-sm">Random</span>
          </button>

          <button
            onClick={() => onSelect('black')}
            onMouseEnter={() => setHoveredColor('black')}
            onMouseLeave={() => setHoveredColor(null)}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
              hoveredColor === 'black'
                ? 'border-slate-500 bg-slate-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-slate-400 hover:shadow-md'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 border-2 border-gray-600 flex items-center justify-center shadow-inner">
              <span className="text-2xl text-white">♚</span>
            </div>
            <span className="font-semibold text-gray-700 text-sm">Black</span>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2.5 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
