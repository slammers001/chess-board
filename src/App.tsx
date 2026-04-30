import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { BotGame } from './components/BotGame';
import { ColorSelectionDialog } from './components/ColorSelectionDialog';
import { BotSelectionDialog } from './components/BotSelectionDialog';

type AppMode = 'practice' | 'bot-select' | 'color-select' | 'bot-game';
type BotDifficulty = 'easy' | 'medium' | 'hard';

function App() {
  const [mode, setMode] = useState<AppMode>('practice');
  const [botPlayerColor, setBotPlayerColor] = useState<'white' | 'black'>('white');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('easy');

  const handlePlayVsBot = () => {
    setMode('bot-select');
  };

  const handleColorSelect = (color: 'white' | 'black' | 'random') => {
    const chosen = color === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : color;
    setBotPlayerColor(chosen);
    setMode('bot-game');
  };

  const handleBotSelect = (difficulty: BotDifficulty) => {
    setBotDifficulty(difficulty);
    setMode('color-select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {mode === 'practice' && (
        <ChessBoard onPlayVsBot={handlePlayVsBot} />
      )}

      {mode === 'bot-select' && (
        <BotSelectionDialog
          onSelect={handleBotSelect}
          onCancel={() => setMode('practice')}
        />
      )}

      {mode === 'color-select' && (
        <ColorSelectionDialog
          onSelect={handleColorSelect}
          onCancel={() => setMode('practice')}
        />
      )}

      {mode === 'bot-game' && (
        <BotGame
          playerColor={botPlayerColor}
          botDifficulty={botDifficulty}
          onBack={() => setMode('practice')}
        />
      )}
    </div>
  );
}

export default App;
