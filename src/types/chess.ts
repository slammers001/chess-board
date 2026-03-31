export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  piece: ChessPiece | null;
}

export interface BoardPosition {
  [key: string]: Square;
}

export interface Arrow {
  from: string;
  to: string;
  color: string;
}

export interface Highlight {
  square: string;
  color: string;
}

export interface DrawnCircle {
  x: number;
  y: number;
  radius: number;
}

export interface DrawnLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
