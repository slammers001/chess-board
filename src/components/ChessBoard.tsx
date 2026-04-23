import { useState, useEffect } from 'react';
import { BoardPosition, ChessPiece } from '../types/chess';
import { files, ranks, getSquareKey, getInitialPosition, getPieceSymbol } from '../chessUtils';
import { ChessSquare } from './ChessSquare';
import { RotateCcw, FlipVertical2, Bot } from 'lucide-react';

interface ChessBoardProps {
  onPlayVsBot?: () => void;
}

export function ChessBoard({ onPlayVsBot }: ChessBoardProps) {
  const [position, setPosition] = useState<BoardPosition>(getInitialPosition());
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<BoardPosition[]>([getInitialPosition()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: ChessPiece[], black: ChessPiece[] }>({ white: [], black: [] });

  const boardFlipped = playerColor === 'black';
  const boardImage = boardFlipped ? './board-black.png' : './board-white.png';
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

  const handleCapturedPieceDragStart = (_piece: ChessPiece, color: 'white' | 'black', index: number) => {
    // Store the captured piece info for dropping
    setDraggedPiece(`captured-${color}-${index}`);
    setSelectedPiece(`captured-${color}-${index}`);
  };

  const handleDrop = (targetSquare: string) => {
    if (!draggedPiece) return;

    // Don't allow dropping on the same square
    if (draggedPiece === targetSquare) {
      setDraggedPiece(null);
      setSelectedPiece(null);
      return;
    }

    // Check if dragging a captured piece
    if (draggedPiece.startsWith('captured-')) {
      const [, color, indexStr] = draggedPiece.split('-');
      const index = parseInt(indexStr);
      const piece = color === 'white' ? capturedPieces.white[index] : capturedPieces.black[index];
      
      if (piece) {
        // Place the captured piece on the board
        const newPosition = { ...position };
        newPosition[targetSquare] = { piece };
        
        // Remove from captured pieces
        const newCaptured = { ...capturedPieces };
        if (color === 'white') {
          newCaptured.white = newCaptured.white.filter((_: ChessPiece, i: number) => i !== index);
        } else {
          newCaptured.black = newCaptured.black.filter((_: ChessPiece, i: number) => i !== index);
        }
        
        setPosition(newPosition);
        setCapturedPieces(newCaptured);
        
        const newHistory = moveHistory.slice(0, historyIndex + 1);
        newHistory.push(newPosition);
        setMoveHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } else {
      // Normal piece movement
      const newPosition = { ...position };
      
      // If moving to an occupied square, capture the piece
      if (newPosition[targetSquare]?.piece) {
        const capturedPiece = newPosition[targetSquare].piece;
        if (capturedPiece) {
          const newCaptured = { ...capturedPieces };
          newCaptured[capturedPiece.color].push(capturedPiece);
          setCapturedPieces(newCaptured);
        }
      }
      
      newPosition[targetSquare] = { ...newPosition[draggedPiece] };
      newPosition[draggedPiece] = { piece: null };

      setPosition(newPosition);

      const newHistory = moveHistory.slice(0, historyIndex + 1);
      newHistory.push(newPosition);
      setMoveHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setDraggedPiece(null);
    setSelectedPiece(null);
  };

  const resetBoard = () => {
    const initialPosition = getInitialPosition();
    setPosition(initialPosition);
    setMoveHistory([initialPosition]);
    setHistoryIndex(0);
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

  const flipBoard = () => {
    setPlayerColor(playerColor === 'white' ? 'black' : 'white');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Z') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, moveHistory.length]);

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
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 select-none"
        >
          <FlipVertical2 size={16} />
          Switch Side
        </button>

        <button
          onClick={undo}
          disabled={historyIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          Undo
        </button>

        <button
          onClick={redo}
          disabled={historyIndex === moveHistory.length - 1}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          Redo
        </button>

        {onPlayVsBot && (
          <button
            onClick={onPlayVsBot}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 select-none"
          >
            <Bot size={16} />
            Play vs Bot
          </button>
        )}
      </div>

      <div className="text-xs text-gray-600">
        <p>Drag pieces to move them freely</p>
      </div>

      <div className="flex gap-6 items-start">
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

        <div className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg min-w-48">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Captured Pieces</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700">By White:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {capturedPieces.black.map((piece, index: number) => (
                  <img
                    key={index}
                    draggable
                    onDragStart={() => handleCapturedPieceDragStart(piece, 'black', index)}
                    src={getPieceSymbol(piece)}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-8 h-8 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">By Black:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {capturedPieces.white.map((piece, index: number) => (
                  <img
                    key={index}
                    draggable
                    onDragStart={() => handleCapturedPieceDragStart(piece, 'white', index)}
                    src={getPieceSymbol(piece)}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-8 h-8 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
