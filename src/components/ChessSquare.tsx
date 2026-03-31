import { ChessPiece } from '../types/chess';
import { getPieceSymbol } from '../chessUtils';

interface ChessSquareProps {
  squareKey: string;
  piece: ChessPiece | null;
  isHighlighted: boolean;
  isSelected: boolean;
  highlightColor?: string;
  onDragStart: (squareKey: string) => void;
  onDrop: (squareKey: string) => void;
  onRightClick: (squareKey: string, e: React.MouseEvent) => void;
}

export function ChessSquare({
  squareKey,
  piece,
  isHighlighted,
  isSelected,
  highlightColor,
  onDragStart,
  onDrop,
  onRightClick
}: ChessSquareProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (piece) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', squareKey);
      onDragStart(squareKey);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
    >
      {isHighlighted && (
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundColor: highlightColor }}
        />
      )}
      {isSelected && (
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundColor: 'blue' }}
        />
      )}
      {piece && (
        <img
          draggable
          onDragStart={handleDragStart}
          src={getPieceSymbol(piece)}
          alt={`${piece.color} ${piece.type}`}
          className="w-16 h-16 select-none cursor-grab active:cursor-grabbing z-10 hover:scale-110 transition-transform"
        />
      )}
    </div>
  );
}
