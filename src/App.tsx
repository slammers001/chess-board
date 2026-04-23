import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { BotGame } from './components/BotGame';
import { ColorSelectionDialog } from './components/ColorSelectionDialog';

type AppMode = 'practice' | 'bot-select' | 'bot-game';

function App() {
  const [mode, setMode] = useState<AppMode>('practice');
  const [botPlayerColor, setBotPlayerColor] = useState<'white' | 'black'>('white');

  const handleColorSelect = (color: 'white' | 'black' | 'random') => {
    const chosen = color === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : color;
    setBotPlayerColor(chosen);
    setMode('bot-game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {mode === 'practice' && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl flex justify-center mt-4">
            <button
              onClick={() => setMode('bot-select')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Play vs Bot
            </button>
          </div>
          <ChessBoard />
        </div>
      )}

      {mode === 'bot-select' && (
        <ColorSelectionDialog
          onSelect={handleColorSelect}
          onCancel={() => setMode('practice')}
        />
      )}

      {mode === 'bot-game' && (
        <BotGame
          playerColor={botPlayerColor}
          onBack={() => setMode('practice')}
        />
      )}
    </div>
  );
}

export default App;
