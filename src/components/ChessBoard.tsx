import { useState } from 'react';
import { BoardPosition } from '../types/chess';
import { files, ranks, getSquareKey, getInitialPosition, getSquareColor } from '../chessUtils';
import { ChessSquare } from './ChessSquare';
import { RotateCcw, FlipVertical2 } from 'lucide-react';

export function ChessBoard() {
  const [position, setPosition] = useState<BoardPosition>(getInitialPosition());
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [moveHistory, setMoveHistory] = useState<BoardPosition[]>([getInitialPosition()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const displayFiles = boardFlipped ? [...files].reverse() : files;
  const displayRanks = boardFlipped ? [...ranks].reverse() : ranks;

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
    setBoardFlipped(!boardFlipped);
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
          Flip
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

      <div className="relative">
        <div className="grid grid-cols-8 gap-0 border-4 border-gray-800 shadow-2xl" style={{ width: 'fit-content' }}>
          {displayRanks.map((rank: string) => (
            displayFiles.map((file: string) => {
              const squareKey = getSquareKey(file, rank);
              const square = position[squareKey];
              const isLight = getSquareColor(file, rank) === 'light';

              return (
                <div key={squareKey} className="w-16 h-16">
                  <ChessSquare
                    squareKey={squareKey}
                    piece={square.piece}
                    isLight={isLight}
                    isHighlighted={false}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRightClick={() => {}}
                  />
                </div>
              );
            })
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8" style={{ transform: 'translateY(-20px)' }}>
          {displayFiles.map((file: string) => (
            <div key={`file-label-${file}`} className="text-xs font-bold text-gray-700 w-16 text-center">
              {file}
            </div>
          ))}
        </div>

        <div className="absolute top-0 bottom-0 left-0 flex flex-col-reverse justify-center gap-2 ml-1">
          {displayRanks.map((rank: string) => (
            <div key={`rank-label-${rank}`} className="text-xs font-bold text-gray-700 h-16 flex items-center">
              {rank}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
