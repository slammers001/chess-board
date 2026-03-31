import { useState } from 'react';
import { BoardPosition } from '../types/chess';
import { files, ranks, getSquareKey, getInitialPosition, getSquareColor } from '../chessUtils';
import { ChessSquare } from './ChessSquare';
import { RotateCcw, FlipVertical2 } from 'lucide-react';

export function ChessBoard() {
  const [position, setPosition] = useState<BoardPosition>(getInitialPosition());
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<BoardPosition[]>([getInitialPosition()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const boardFlipped = playerColor === 'black';
  const boardImage = boardFlipped ? '/board-black.png' : '/board-white.png';
  const displayPosition = position;
  
  // Debug: Check if transformation is working
  if (playerColor === 'white') {
    console.log('Playing as white - a1 piece:', displayPosition['a1']?.piece);
    console.log('Playing as white - a8 piece:', displayPosition['a8']?.piece);
  }

  const handleDragStart = (squareKey: string) => {
    setDraggedPiece(squareKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSquare: string) => {
    if (!draggedPiece) return;

    const newPosition = { ...position };
    newPosition[targetSquare] = { ...newPosition[draggedPiece] };
    newPosition[draggedPiece] = { piece: null };

    setPosition(newPosition);
    setDraggedPiece(null);

    const newHistory = moveHistory.slice(0, historyIndex + 1);
    newHistory.push(newPosition);
    setMoveHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const resetBoard = () => {
    const initialPosition = getInitialPosition();
    setPosition(initialPosition);
    setMoveHistory([initialPosition]);
    setHistoryIndex(0);
  };

  const flipBoard = () => {
    setPlayerColor(playerColor === 'white' ? 'black' : 'white');
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPosition(moveHistory[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < moveHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPosition(moveHistory[historyIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-3xl font-bold text-gray-800">Chess Practice Board</h1>

      <div className="flex gap-2 flex-wrap justify-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Playing as:</span>
          <button
            onClick={() => setPlayerColor('white')}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              playerColor === 'white' 
                ? 'bg-white text-gray-800 border-2 border-gray-800' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            White
          </button>
          <button
            onClick={() => setPlayerColor('black')}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              playerColor === 'black' 
                ? 'bg-gray-800 text-white border-2 border-gray-800' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Black
          </button>
        </div>

        <button
          onClick={resetBoard}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <RotateCcw size={18} />
          Reset
        </button>

        <button
          onClick={flipBoard}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <FlipVertical2 size={18} />
          Switch Side
        </button>

        <button
          onClick={undo}
          disabled={historyIndex === 0}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Undo
        </button>

        <button
          onClick={redo}
          disabled={historyIndex === moveHistory.length - 1}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Redo
        </button>
      </div>

      <div className="text-xs text-gray-600">
        <p>Drag pieces to move them freely</p>
      </div>

      <div className="relative" style={{ width: '512px', height: '512px' }}>
        <img 
          src={boardImage} 
          alt="Chess Board" 
          className="absolute inset-0 w-full h-full"
        />
        {files.map((file: string) => 
          ranks.map((rank: string) => {
            const squareKey = getSquareKey(file, rank);
            const square = displayPosition[squareKey];
            
            // Calculate position (0-based)
            const fileIndex = boardFlipped ? 7 - files.indexOf(file) : files.indexOf(file);
            const rankIndex = boardFlipped ? ranks.indexOf(rank) : 7 - ranks.indexOf(rank);
            
            const left = fileIndex * 64; // 64px per square
            const top = rankIndex * 64;  // 64px per square
            
            return (
              <div
                key={squareKey}
                className="absolute w-16 h-16"
                style={{ left: `${left}px`, top: `${top}px` }}
              >
                <ChessSquare
                  squareKey={squareKey}
                  piece={square.piece}
                  isLight={false} // Not needed with board image
                  isHighlighted={false}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onRightClick={() => {}}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
