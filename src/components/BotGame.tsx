import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { files, ranks, getSquareKey, getPieceSymbol } from '../chessUtils';
import { ChessSquare } from './ChessSquare';
import {
  fenToBoardPosition,
  getGameStatus,
  getLegalMoves,
  getTurnFromFen,
  isInCheck,
} from '../chessBot';
import { RotateCcw, ArrowLeft, Bot, User, Crown } from 'lucide-react';
import { ChessPiece } from '../types/chess';

interface BotGameProps {
  playerColor: 'white' | 'black';
  onBack: () => void;
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface MoveRecord {
  san: string;
  color: 'white' | 'black';
}

export function BotGame({ playerColor, onBack }: BotGameProps) {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const isThinkingRef = useRef(false);
  const gameOverRef = useRef(false);
  const gameRef = useRef(new Chess());

  const boardFlipped = playerColor === 'black';
  const position = fenToBoardPosition(fen);
  const turn = getTurnFromFen(fen);
  const status = getGameStatus(fen);
  const inCheck = isInCheck(fen);
  const isPlayerTurn = turn === playerColor;
  const botColor = playerColor === 'white' ? 'black' : 'white';

  // Sync gameOver ref
  useEffect(() => {
    if (status.isOver && !gameOverRef.current) {
      setGameOver(true);
      gameOverRef.current = true;
    }
  }, [status.isOver]);

  const applyMove = useCallback((moveResult: Move, color: 'white' | 'black') => {
    const newFen = gameRef.current.fen();
    setFen(newFen);
    setLastMove({ from: moveResult.from, to: moveResult.to });
    setMoveRecords(prev => [...prev, { san: moveResult.san, color }]);
  }, []);

  const botMove = useCallback(() => {
    if (isThinkingRef.current || gameOverRef.current) return;
    if (gameRef.current.turn() === (playerColor === 'white' ? 'w' : 'b')) return;
    if (gameRef.current.isGameOver()) return;

    isThinkingRef.current = true;
    setIsThinking(true);

    // Use a very simple approach: pick a random move from the top 3 evaluated moves
    // This avoids the minimax blocking the main thread
    setTimeout(() => {
      try {
        const moves = gameRef.current.moves({ verbose: true });
        if (moves.length === 0) {
          isThinkingRef.current = false;
          setIsThinking(false);
          return;
        }

        // Simple evaluation: score each move by immediate capture value + basic positional bonus
        const scored = moves.map((m: Move) => {
          let score = 0;
          if (m.captured) {
            const vals: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900 };
            score += vals[m.captured] || 0;
          }
          if (m.promotion) score += 800;
          if (m.san.includes('+')) score += 50;
          if (m.san.includes('#')) score += 99999;
          // Prefer center moves
          const centerFiles = ['d', 'e'];
          const centerRanks = ['4', '5'];
          if (centerFiles.includes(m.to[0]) && centerRanks.includes(m.to[1])) score += 20;
          // Add a small random factor so it doesn't play the same every time
          score += Math.random() * 30;
          return { move: m, score };
        });

        scored.sort((a, b) => b.score - a.score);

        // Pick from top 3 moves with weighted random
        const topN = scored.slice(0, Math.min(3, scored.length));
        const pick = topN[Math.floor(Math.random() * topN.length)];
        const chosenMove = pick.move;

        gameRef.current.move(chosenMove);
        applyMove(chosenMove, botColor);
      } catch {
        // If anything goes wrong, just skip
      }
      isThinkingRef.current = false;
      setIsThinking(false);
    }, 300);
  }, [playerColor, botColor, applyMove]);

  useEffect(() => {
    if (!isPlayerTurn && !gameOverRef.current && !isThinkingRef.current) {
      const timer = setTimeout(botMove, 200);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, isThinking, botMove]);

  // If player is black, bot moves first
  useEffect(() => {
    if (playerColor === 'black' && fen === INITIAL_FEN && !isThinkingRef.current) {
      const timer = setTimeout(botMove, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSquareClick = (squareKey: string) => {
    if (gameOver || !isPlayerTurn || isThinking || promotionPending) return;

    const piece = position[squareKey]?.piece;

    if (selectedSquare && legalMoves.includes(squareKey)) {
      const movingPiece = gameRef.current.get(selectedSquare as Square);
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && squareKey[1] === '8') ||
          (movingPiece.color === 'b' && squareKey[1] === '1'));

      if (isPromotion) {
        setPromotionPending({ from: selectedSquare, to: squareKey });
        return;
      }

      try {
        const moveResult = gameRef.current.move({
          from: selectedSquare as Square,
          to: squareKey as Square,
        });
        if (moveResult) {
          applyMove(moveResult, playerColor);
        }
      } catch {
        // Invalid move
      }
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (piece && piece.color === playerColor) {
      setSelectedSquare(squareKey);
      setLegalMoves(getLegalMoves(fen, squareKey));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotion = (promotionType: string) => {
    if (!promotionPending) return;
    try {
      const moveResult = gameRef.current.move({
        from: promotionPending.from as Square,
        to: promotionPending.to as Square,
        promotion: promotionType as 'q' | 'r' | 'b' | 'n',
      });
      if (moveResult) {
        applyMove(moveResult, playerColor);
      }
    } catch {
      // Invalid promotion
    }
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleDragStart = (squareKey: string) => {
    if (gameOver || !isPlayerTurn || isThinking) return;
    const piece = position[squareKey]?.piece;
    if (piece && piece.color === playerColor) {
      setSelectedSquare(squareKey);
      setLegalMoves(getLegalMoves(fen, squareKey));
    }
  };

  const handleDrop = (targetSquare: string) => {
    if (!selectedSquare || !isPlayerTurn || isThinking || promotionPending) return;

    if (legalMoves.includes(targetSquare)) {
      const movingPiece = gameRef.current.get(selectedSquare as Square);
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && targetSquare[1] === '8') ||
          (movingPiece.color === 'b' && targetSquare[1] === '1'));

      if (isPromotion) {
        setPromotionPending({ from: selectedSquare, to: targetSquare });
        return;
      }

      try {
        const moveResult = gameRef.current.move({
          from: selectedSquare as Square,
          to: targetSquare as Square,
        });
        if (moveResult) {
          applyMove(moveResult, playerColor);
        }
      } catch {
        // Invalid move
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const resetGame = () => {
    gameRef.current = new Chess();
    setFen(INITIAL_FEN);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setMoveRecords([]);
    setPromotionPending(null);
    setGameOver(false);
    gameOverRef.current = false;
    isThinkingRef.current = false;
    setIsThinking(false);
  };

  // Build display rows for move list
  const moveRows: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moveRecords.length; i += 2) {
    moveRows.push({
      num: Math.floor(i / 2) + 1,
      white: moveRecords[i].san,
      black: moveRecords[i + 1]?.san,
    });
  }

  const displayFiles = boardFlipped ? [...files].reverse() : files;
  const displayRanks = boardFlipped ? ranks : [...ranks].reverse();

  return (
    <div className="flex flex-col items-center gap-4 p-6 select-none">
      <div className="flex items-center gap-4 w-full max-w-4xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Play vs Bot</h1>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
        >
          <RotateCcw size={16} />
          New Game
        </button>
      </div>

      {/* Status bar */}
      <div className={`w-full max-w-4xl px-4 py-3 rounded-xl text-center font-semibold text-sm shadow-sm ${
        status.isOver
          ? 'bg-amber-100 text-amber-800 border border-amber-200'
          : inCheck
          ? 'bg-red-100 text-red-800 border border-red-200'
          : isThinking
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : isPlayerTurn
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-50 text-gray-600 border border-gray-200'
      }`}>
        {status.isOver ? (
          <span className="flex items-center justify-center gap-2">
            <Crown size={16} />
            {status.result}
          </span>
        ) : inCheck ? (
          `${turn === 'white' ? 'White' : 'Black'} is in check!`
        ) : isThinking ? (
          <span className="flex items-center justify-center gap-2">
            <Bot size={16} className="animate-pulse" />
            Bot is thinking...
          </span>
        ) : isPlayerTurn ? (
          <span className="flex items-center justify-center gap-2">
            <User size={16} />
            Your turn ({playerColor})
          </span>
        ) : (
          "Bot's turn"
        )}
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-2">
          {/* Bot info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Bot size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Bot</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              botColor === 'white' ? 'bg-gray-200 text-gray-700' : 'bg-gray-800 text-white'
            }`}>
              {botColor}
            </span>
            {isThinking && <span className="ml-auto text-xs text-blue-600 animate-pulse">thinking...</span>}
          </div>

          {/* Board with labels */}
          <div className="flex items-end gap-0">
            {/* Rank labels on left */}
            <div className="flex flex-col" style={{ width: '20px' }}>
              {displayRanks.map((rank) => (
                <div key={rank} className="h-20 flex items-center justify-center text-xs font-semibold text-gray-500">
                  {rank}
                </div>
              ))}
            </div>

            {/* Board */}
            <div className="relative" style={{ width: '640px', height: '640px' }}>
              <img
                src={boardFlipped ? './board-black.png' : './board-white.png'}
                alt="Chess Board"
                className="absolute inset-0 w-full h-full"
              />
              {files.map((file: string) =>
                ranks.map((rank: string) => {
                  const squareKey = getSquareKey(file, rank);
                  const square = position[squareKey];
                  const fileIndex = boardFlipped ? 7 - files.indexOf(file) : files.indexOf(file);
                  const rankIndex = boardFlipped ? ranks.indexOf(rank) : 7 - ranks.indexOf(rank);
                  const left = fileIndex * 80;
                  const top = rankIndex * 80;

                  const isLegalTarget = legalMoves.includes(squareKey);
                  const isLastMoveSquare = lastMove?.from === squareKey || lastMove?.to === squareKey;
                  const isCheckSquare = inCheck && square?.piece?.type === 'king' && square?.piece?.color === turn;

                  return (
                    <div
                      key={squareKey}
                      className="absolute w-20 h-20"
                      style={{ left: `${left}px`, top: `${top}px` }}
                      onClick={() => handleSquareClick(squareKey)}
                    >
                      <ChessSquare
                        squareKey={squareKey}
                        piece={square?.piece as ChessPiece | null}
                        isHighlighted={isLegalTarget}
                        isSelected={selectedSquare === squareKey}
                        highlightColor={square?.piece ? 'rgba(220, 38, 38, 0.5)' : 'rgba(34, 197, 94, 0.5)'}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onRightClick={() => handleSquareClick(squareKey)}
                      />
                      {isLastMoveSquare && (
                        <div className="absolute inset-0 opacity-30 bg-yellow-400 pointer-events-none rounded-sm" />
                      )}
                      {isCheckSquare && (
                        <div className="absolute inset-0 opacity-40 bg-red-500 pointer-events-none rounded-sm" />
                      )}
                      {isLegalTarget && !square?.piece && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/40" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* File labels below board */}
          <div className="flex" style={{ marginLeft: '20px' }}>
            {displayFiles.map((file) => (
              <div key={file} className="w-20 flex items-center justify-center text-xs font-semibold text-gray-500">
                {file}
              </div>
            ))}
          </div>

          {/* Player info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <User size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">You</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              playerColor === 'white' ? 'bg-gray-200 text-gray-700' : 'bg-gray-800 text-white'
            }`}>
              {playerColor}
            </span>
            {isPlayerTurn && !status.isOver && (
              <span className="ml-auto text-xs text-emerald-600 font-medium">your turn</span>
            )}
          </div>
        </div>

        {/* Move history */}
        <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl min-w-56 max-h-[660px] overflow-y-auto border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Moves</h3>
          {moveRows.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No moves yet</p>
          ) : (
            <div className="space-y-0.5">
              {moveRows.map((row) => (
                <div key={row.num} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-6 text-right">{row.num}.</span>
                  <span className={`font-mono px-1.5 py-0.5 rounded ${
                    row.white === moveRecords[moveRecords.length - 1]?.san
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600'
                  }`}>
                    {row.white}
                  </span>
                  {row.black && (
                    <span className={`font-mono px-1.5 py-0.5 rounded ${
                      row.black === moveRecords[moveRecords.length - 1]?.san
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-600'
                    }`}>
                      {row.black}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promotion dialog */}
      {promotionPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Promote Pawn</h3>
            <div className="grid grid-cols-4 gap-3">
              {['queen', 'rook', 'bishop', 'knight'].map((type) => {
                const piece: ChessPiece = { type: type as any, color: playerColor };
                return (
                  <button
                    key={type}
                    onClick={() => handlePromotion(type[0])}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                  >
                    <img
                      src={getPieceSymbol(piece)}
                      alt={type}
                      className="w-12 h-12"
                    />
                    <span className="text-xs font-medium text-gray-600 capitalize">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
