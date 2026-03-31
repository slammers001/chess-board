import { useState } from 'react';
import { BoardPosition } from '../types/chess';
import { files, ranks, getSquareKey, getInitialPosition } from '../chessUtils';
import { ChessSquare } from './ChessSquare';
import { RotateCcw, FlipVertical2 } from 'lucide-react';

export function ChessBoard() {
  const [position, setPosition] = useState<BoardPosition>(getInitialPosition());
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<BoardPosition[]>([getInitialPosition()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const boardFlipped = playerColor === 'black';
  const boardImage = boardFlipped ? '/board-black.png' : '/board-white.png';
  const displayPosition = position;
  
  // Debug: Check if transformation is working
  if (playerColor === 'white') {
    console.log('Playing as white - a1 piece:', displayPosition['a1']?.piece);
    console.log('Playing as white - a8 piece:', displayPosition['a8']?.piece);
  }

  const handleDragStart = (squareKey: string) => {
    // Only allow dragging if there's no piece already being dragged
    if (draggedPiece) return;
    
    setDraggedPiece(squareKey);
    setSelectedPiece(squareKey);
  };

  const handleDrop = (targetSquare: string) => {
    if (!draggedPiece) return;

    // Don't allow dropping on the same square
    if (draggedPiece === targetSquare) {
      setDraggedPiece(null);
      setSelectedPiece(null);
      return;
    }

    const newPosition = { ...position };
    newPosition[targetSquare] = { ...newPosition[draggedPiece] };
    newPosition[draggedPiece] = { piece: null };

    setPosition(newPosition);
    setDraggedPiece(null);
    setSelectedPiece(null);

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

  return (
    <div className="flex flex-col items-center gap-4 p-6 select-none">
      <h1 className="text-3xl font-bold text-gray-800">Chess Practice Board</h1>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={resetBoard}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 select-none"
        >
          <RotateCcw size={16} />
          Reset Board
        </button>

        <button
          onClick={flipBoard}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <FlipVertical2 size={16} />
          Switch Side
        </button>
      </div>

      <div className="text-xs text-gray-600">
        <p>Drag pieces to move them freely</p>
      </div>

      <div className="relative" style={{ width: '640px', height: '640px' }}>
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
            
            const left = fileIndex * 80; // 80px per square
            const top = rankIndex * 80;  // 80px per square
            
            return (
              <div
                key={squareKey}
                className="absolute w-20 h-20"
                style={{ left: `${left}px`, top: `${top}px` }}
              >
                <ChessSquare
                  squareKey={squareKey}
                  piece={square.piece}
                  isHighlighted={false}
                  isSelected={selectedPiece === squareKey}
                  onDragStart={handleDragStart}
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
