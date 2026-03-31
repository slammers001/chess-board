import { ChessPiece } from '../types/chess';
import { getPieceSymbol } from '../chessUtils';

interface ChessSquareProps {
  squareKey: string;
  piece: ChessPiece | null;
  isLight: boolean;
  isHighlighted: boolean;
  highlightColor?: string;
  onDragStart: (squareKey: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (squareKey: string) => void;
  onRightClick: (squareKey: string, e: React.MouseEvent) => void;
}

export function ChessSquare({
  squareKey,
  piece,
  isLight,
  isHighlighted,
  highlightColor,
  onDragStart,
  onDragOver,
  onDrop,
  onRightClick
}: ChessSquareProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (piece) {
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(squareKey);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(squareKey);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(squareKey, e);
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center cursor-pointer ${
        isLight ? 'bg-amber-100' : 'bg-amber-700'
      }`}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
    >
      {isHighlighted && (
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundColor: highlightColor }}
        />
      )}
      {piece && (
        <div
          draggable
          onDragStart={handleDragStart}
          className="text-5xl select-none cursor-grab active:cursor-grabbing z-10 hover:scale-110 transition-transform"
        >
          {getPieceSymbol(piece)}
        </div>
      )}
    </div>
  );
}
