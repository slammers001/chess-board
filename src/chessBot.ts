import { Chess, Move, Square } from 'chess.js';

/* =========================
   PIECE VALUES
========================= */
const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

/* =========================
   POSITION TABLES
========================= */
const POSITION_TABLES: Record<string, number[]> = {
  pawn: [
    0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    20, 5, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  knight: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  bishop: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  rook: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  queen: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  king: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

/* =========================
   HEURISTICS MEMORY
========================= */
const TT = new Map<string, { depth: number; value: number }>();
const KILLERS: Record<number, string[]> = {};

/* =========================
   POSITION BONUS
========================= */
function getPositionBonus(pieceType: string, square: string, isWhite: boolean): number {
  const table = POSITION_TABLES[pieceType];
  if (!table) return 0;

  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  const index = isWhite ? (7 - rank) * 8 + file : rank * 8 + file;

  return table[index] || 0;
}

/* =========================
   EVALUATION
========================= */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const square = String.fromCharCode(97 + c) + (8 - r);
      const value = PIECE_VALUES[piece.type] || 0;
      const bonus = getPositionBonus(piece.type, square, piece.color === 'w');
      const total = value + bonus;

      score += piece.color === 'w' ? total : -total;
    }
  }

  return score;
}

/* =========================
   MOVE ORDERING (STRONG)
========================= */
function moveScore(move: Move, depth: number): number {
  let score = 0;

  if (move.captured) {
    score += 10000 + (PIECE_VALUES[move.captured] || 0);
  }

  if (move.promotion) score += 9000;
  if (move.san.includes('+')) score += 500;

  if (KILLERS[depth]?.includes(move.san)) {
    score += 8000;
  }

  return score;
}

function orderMoves(moves: Move[], depth: number): Move[] {
  return moves.sort((a, b) => moveScore(b, depth) - moveScore(a, depth));
}

/* =========================
   QUIESCENCE SEARCH
========================= */
function quiescence(game: Chess, alpha: number, beta: number): number {
  const stand = evaluateBoard(game);

  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;

  const moves = game.moves({ verbose: true }).filter(m => m.captured);

  for (const move of moves) {
    game.move(move.san);
    const score = -quiescence(game, -beta, -alpha);
    game.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

/* =========================
   MINIMAX (UPGRADED)
========================= */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  const key = game.fen();

  const cached = TT.get(key);
  if (cached && cached.depth >= depth) {
    return cached.value;
  }

  if (depth === 0) {
    return quiescence(game, alpha, beta);
  }

  if (game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = orderMoves(game.moves({ verbose: true }), depth);

  let best = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move.san);

    const val = minimax(game, depth - 1, alpha, beta, !maximizing);

    game.undo();

    if (maximizing) {
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
    } else {
      best = Math.min(best, val);
      beta = Math.min(beta, val);
    }

    if (beta <= alpha) {
      if (!KILLERS[depth]) KILLERS[depth] = [];
      KILLERS[depth].push(move.san);
      break;
    }
  }

  TT.set(key, { depth, value: best });

  return best;
}

/* =========================
   ITERATIVE DEEPENING
========================= */
export function getLegalMoves(fen: string, from: string): string[] {
  try {
    const game = new Chess(fen);
    const moves = game.moves({ square: from as Square, verbose: true });
    return moves.map(m => m.to);
  } catch {
    return [];
  }
}

export function isValidMove(fen: string, from: string, to: string, promotion?: string): boolean {
  try {
    const game = new Chess(fen);
    const move = game.move({ from: from as Square, to: to as Square, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
    return !!move;
  } catch {
    return false;
  }
}

export function getBestMove(fen: string, maxDepth = 5): Move | null {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (!moves.length) return null;

  const white = game.turn() === 'w';
  let bestMove: Move | null = null;
  let bestValue = white ? -Infinity : Infinity;

  for (let depth = 1; depth <= maxDepth; depth++) {
    let bestVal = white ? -Infinity : Infinity;

    for (const move of moves) {
      game.move(move.san);

      const val = minimax(game, depth - 1, -Infinity, Infinity, !white);

      game.undo();

      if (white ? val > bestVal : val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

/* =========================
   UTILITIES (UNCHANGED)
========================= */
const TYPE_MAP: Record<string, string> = {
  p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king',
};

export function fenToBoardPosition(fen: string): Record<string, { piece: { type: string; color: string } | null }> {
  const game = new Chess(fen);
  const board = game.board();

  const position: Record<string, { piece: { type: string; color: string } | null }> = {};

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = String.fromCharCode(97 + c) + (8 - r);
      const piece = board[r][c];
      position[square] = piece
        ? { piece: { type: TYPE_MAP[piece.type] || piece.type, color: piece.color === 'w' ? 'white' : 'black' } }
        : { piece: null };
    }
  }

  return position;
}

export function getGameStatus(fen: string): { isOver: boolean; result: string } {
  const game = new Chess(fen);
  if (game.isCheckmate()) {
    return { isOver: true, result: game.turn() === 'w' ? 'Black wins' : 'White wins' };
  }
  if (game.isStalemate()) return { isOver: true, result: 'Draw by stalemate!' };
  if (game.isThreefoldRepetition()) return { isOver: true, result: 'Draw by threefold repetition!' };
  if (game.isInsufficientMaterial()) return { isOver: true, result: 'Draw by insufficient material!' };
  if (game.isDraw()) return { isOver: true, result: 'Draw!' };
  return { isOver: false, result: '' };
}

export function isInCheck(fen: string): boolean {
  const game = new Chess(fen);
  return game.isCheck();
}

export function getTurnFromFen(fen: string): 'white' | 'black' {
  return fen.split(' ')[1] === 'w' ? 'white' : 'black';
}
