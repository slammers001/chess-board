import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { files, ranks, getSquareKey, getPieceSymbol } from '../chessUtils';
import { ChessSquare } from './ChessSquare';
import {
  fenToBoardPosition,
  getBestMove,
  getGameStatus,
  getLegalMoves,
  getTurnFromFen,
  isInCheck,
  makeMove,
} from '../chessBot';
import { RotateCcw, ArrowLeft, Bot, User, Crown } from 'lucide-react';
import { ChessPiece } from '../types/chess';

interface BotGameProps {
  playerColor: 'white' | 'black';
  onBack: () => void;
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function BotGame({ playerColor, onBack }: BotGameProps) {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([INITIAL_FEN]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  const boardFlipped = playerColor === 'black';
  const position = fenToBoardPosition(fen);
  const turn = getTurnFromFen(fen);
  const status = getGameStatus(fen);
  const inCheck = isInCheck(fen);
  const isPlayerTurn = turn === playerColor;
  const botColor = playerColor === 'white' ? 'black' : 'white';

  const botMove = useCallback(() => {
    if (status.isOver || isPlayerTurn) return;

    setIsThinking(true);
    setTimeout(() => {
      const best = getBestMove(fen, 3);
      if (best) {
        const newFen = makeMove(fen, best.from, best.to, best.promotion);
        if (newFen) {
          setFen(newFen);
          setLastMove({ from: best.from, to: best.to });
          const newHistory = moveHistory.slice(0, historyIndex + 1);
          newHistory.push(newFen);
          setMoveHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
      setIsThinking(false);
    }, 300);
  }, [fen, isPlayerTurn, status.isOver, moveHistory, historyIndex]);

  useEffect(() => {
    if (!isPlayerTurn && !status.isOver && !isThinking) {
      botMove();
    }
  }, [isPlayerTurn, status.isOver, isThinking, botMove]);

  useEffect(() => {
    if (playerColor === 'black' && fen === INITIAL_FEN) {
      botMove();
    }
  }, []);

  const handleSquareClick = (squareKey: string) => {
    if (status.isOver || !isPlayerTurn || isThinking || promotionPending) return;

    const piece = position[squareKey]?.piece;

    if (selectedSquare && legalMoves.includes(squareKey)) {
      const game = new Chess(fen);
      const movingPiece = game.get(selectedSquare as any);
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && squareKey[1] === '8') ||
          (movingPiece.color === 'b' && squareKey[1] === '1'));

      if (isPromotion) {
        setPromotionPending({ from: selectedSquare, to: squareKey });
        return;
      }

      const newFen = makeMove(fen, selectedSquare, squareKey);
      if (newFen) {
        setFen(newFen);
        setLastMove({ from: selectedSquare, to: squareKey });
        const newHistory = moveHistory.slice(0, historyIndex + 1);
        newHistory.push(newFen);
        setMoveHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
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
    const newFen = makeMove(fen, promotionPending.from, promotionPending.to, promotionType);
    if (newFen) {
      setFen(newFen);
      setLastMove({ from: promotionPending.from, to: promotionPending.to });
      const newHistory = moveHistory.slice(0, historyIndex + 1);
      newHistory.push(newFen);
      setMoveHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleDragStart = (squareKey: string) => {
    if (status.isOver || !isPlayerTurn || isThinking) return;
    const piece = position[squareKey]?.piece;
    if (piece && piece.color === playerColor) {
      setSelectedSquare(squareKey);
      setLegalMoves(getLegalMoves(fen, squareKey));
    }
  };

  const handleDrop = (targetSquare: string) => {
    if (!selectedSquare || !isPlayerTurn || isThinking || promotionPending) return;

    if (legalMoves.includes(targetSquare)) {
      const game = new Chess(fen);
      const movingPiece = game.get(selectedSquare as any);
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && targetSquare[1] === '8') ||
          (movingPiece.color === 'b' && targetSquare[1] === '1'));

      if (isPromotion) {
        setPromotionPending({ from: selectedSquare, to: targetSquare });
        return;
      }

      const newFen = makeMove(fen, selectedSquare, targetSquare);
      if (newFen) {
        setFen(newFen);
        setLastMove({ from: selectedSquare, to: targetSquare });
        const newHistory = moveHistory.slice(0, historyIndex + 1);
        newHistory.push(newFen);
        setMoveHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const resetGame = () => {
    setFen(INITIAL_FEN);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setMoveHistory([INITIAL_FEN]);
    setHistoryIndex(0);
    setPromotionPending(null);
  };

  const getMoveList = () => {
    const moves: string[] = [];
    for (let i = 1; i < moveHistory.length; i++) {
      const currGame = new Chess(moveHistory[i]);
      const diff = currGame.history({ verbose: true });
      if (diff.length > 0) {
        const lastMove = diff[diff.length - 1];
        moves.push(lastMove.san);
      }
    }
    return moves;
  };

  const moveList = getMoveList();

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
                    {isLastMoveSquare && !selectedSquare && (
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
        <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl min-w-56 max-h-[640px] overflow-y-auto border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Moves</h3>
          {moveList.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No moves yet</p>
          ) : (
            <div className="space-y-0.5">
              {moveList.map((move, i) => {
                const moveNum = Math.floor(i / 2) + 1;
                const isWhiteMove = i % 2 === 0;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {isWhiteMove && <span className="text-gray-400 w-6 text-right">{moveNum}.</span>}
                    {!isWhiteMove && <span className="w-6" />}
                    <span className={`font-mono px-1.5 py-0.5 rounded ${
                      i === moveList.length - 1 ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600'
                    }`}>
                      {move}
                    </span>
                  </div>
                );
              })}
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
