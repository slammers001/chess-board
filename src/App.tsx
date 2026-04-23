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
        <ChessBoard onPlayVsBot={() => setMode('bot-select')} />
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
