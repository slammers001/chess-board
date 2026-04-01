import { BoardPosition, ChessPiece, PieceType } from './types/chess';

export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const getSquareKey = (file: string, rank: string): string => `${file}${rank}`;

export const getInitialPosition = (): BoardPosition => {
  const position: BoardPosition = {};

  for (const file of files) {
    for (const rank of ranks) {
      position[getSquareKey(file, rank)] = { piece: null };
    }
  }

  const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  files.forEach((file, i) => {
    position[getSquareKey(file, '8')] = {
      piece: { type: backRank[i], color: 'black' }
    };
    position[getSquareKey(file, '7')] = {
      piece: { type: 'pawn', color: 'black' }
    };
    position[getSquareKey(file, '2')] = {
      piece: { type: 'pawn', color: 'white' }
    };
    position[getSquareKey(file, '1')] = {
      piece: { type: backRank[i], color: 'white' }
    };
  });

  return position;
};

export function getPieceSymbol(piece: ChessPiece): string {
  switch (piece.color) {
    case 'white':
      switch (piece.type) {
        case 'king': return './white-king.png';
        case 'queen': return './white-queen.png';
        case 'rook': return './white-rook.png';
        case 'bishop': return './white-bishop.png';
        case 'knight': return './white-knight.png';
        case 'pawn': return './white-pawn.png';
        default: return '';
      }
    case 'black':
      switch (piece.type) {
        case 'king': return './black-king.png';
        case 'queen': return './black-queen.png';
        case 'rook': return './black-rook.png';
        case 'bishop': return './black-bishop.png';
        case 'knight': return './black-knight.png';
        case 'pawn': return './black-pawn.png';
        default: return '';
      }
    default:
      return '';
  }
};

export const getPieceEmoji = (piece: ChessPiece): string => {
  const emojis = {
    white: {
      king: '👑',
      queen: '👸',
      rook: '🏰',
      bishop: '⛪',
      knight: '🐴',
      pawn: '⚪'
    },
    black: {
      king: '👑',
      queen: '💼',
      rook: '🏴',
      bishop: '✝️',
      knight: '🐎',
      pawn: '⚫'
    }
  };

  return emojis[piece.color][piece.type];
};

export const getSquareColor = (file: string, rank: string): 'light' | 'dark' => {
  const fileIndex = files.indexOf(file);
  const rankIndex = parseInt(rank);
  return (fileIndex + rankIndex) % 2 === 0 ? 'dark' : 'light';
};
