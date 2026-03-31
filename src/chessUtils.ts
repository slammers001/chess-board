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

export const getPieceSymbol = (piece: ChessPiece): string => {
  const images = {
    white: {
      king: '/white-king.png',
      queen: '/white-queen.png',
      rook: '/white-rook.png',
      bishop: '/white-bishop.png',
      knight: '/white-knight.png',
      pawn: '/white-pawn.png'
    },
    black: {
      king: '/black-king.png',
      queen: '/black-queen.png',
      rook: '/black-rook.png',
      bishop: '/black-bishop.png',
      knight: '/black-knight.png',
      pawn: '/black-pawn.png'
    }
  };

  return images[piece.color][piece.type];
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
