import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice3D } from './Dice3D';
import { CategoryKey, Die, GamePhase, ScoreCard } from '../types';
import {
  CATEGORIES,
  calculatePotentialScore,
  isEscalera,
  isFull,
  isGenerala,
  isPoker,
} from '../utils/generalaRules';
import { determineAIDecision, pickBestCategoryToScore } from '../utils/aiEngine';
import {
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface DiceBoardProps {
  dice: Die[];
  rollCount: number;
  phase: GamePhase;
  onRoll: () => void;
  onToggleHold: (id: number) => void;
  onAutoHoldSuggested: (indices: number[]) => void;
  onQuickScoreBest: (category: CategoryKey) => void;
  theme: 'dark' | 'light';
  turnPlayer: 'player' | 'ai';
  playerScores: ScoreCard;
  aiScores: ScoreCard;
}

export const DiceBoard: React.FC<DiceBoardProps> = ({
  dice,
  rollCount,
  phase,
  onRoll,
  onToggleHold,
  onAutoHoldSuggested,
  onQuickScoreBest,
  theme,
  turnPlayer,
  playerScores,
  aiScores,
}) => {
  const isPlayerTurn = turnPlayer === 'player';
  const isRolling = phase === 'rolling';
  const canRoll = isPlayerTurn && rollCount < 3 && phase !== 'rolling';
  const diceValues = dice.map((d) => d.value);

  // Compute best category and suggestion for the user automatically
  const bestCategoryKey = rollCount > 0
    ? pickBestCategoryToScore(diceValues, rollCount, playerScores, 'dificil')
    : null;

  const bestScoreInfo = bestCategoryKey
    ? calculatePotentialScore(bestCategoryKey, diceValues, rollCount, playerScores)
    : null;

  const bestCategoryObj = bestCategoryKey
    ? CATEGORIES.find((c) => c.key === bestCategoryKey)
    : null;

  // Compute AI heuristic suggestions for which dice to hold
  const aiEval = rollCount > 0
    ? determineAIDecision(diceValues, rollCount, playerScores, aiScores, 'dificil')
    : null;

  const suggestedHolds = aiEval ? aiEval.heldDiceIndices : [];

  // Combo highlights
  const isServido = rollCount === 1;
  const hasGen = rollCount > 0 && isGenerala(diceValues);
  const hasPok = rollCount > 0 && !hasGen && isPoker(diceValues);
  const hasFul = rollCount > 0 && !hasGen && isFull(diceValues);
  const hasEsc = rollCount > 0 && isEscalera(diceValues);

  return (
    <div
      id="dice-board-compact"
      className={`
        w-full rounded-2xl p-3 sm:p-4 border transition-all duration-200
        ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-800 shadow-lg'
            : 'bg-stone-50/95 border-stone-200 shadow-md'
        }
      `}
    >
      {/* Top mini status banner */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`
              px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1
              ${
                isPlayerTurn
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-purple-600 text-white'
              }
            `}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {isPlayerTurn ? 'Tu Turno' : 'Turno IA'}
          </span>

          <span className="text-xs text-zinc-500 font-medium">
            {rollCount === 0 ? 'Sin tiros' : `Tiro ${rollCount}/3`}
          </span>
        </div>

        {/* Combo Tag */}
        {(hasGen || hasPok || hasFul || hasEsc) && rollCount > 0 && (
          <span
            className={`
              text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wide
              ${
                hasGen
                  ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-300'
                  : hasPok
                  ? 'bg-purple-500 text-white'
                  : hasFul
                  ? 'bg-blue-500 text-white'
                  : 'bg-emerald-500 text-white'
              }
            `}
          >
            {hasGen && `Generala ${isServido ? 'Servida (60)' : '(50)'}`}
            {hasPok && `Póker ${isServido ? 'Servido (45)' : '(40)'}`}
            {hasFul && `Full ${isServido ? 'Servido (35)' : '(30)'}`}
            {hasEsc && `Escalera ${isServido ? 'Servida (25)' : '(20)'}`}
          </span>
        )}
      </div>

      {/* 5 Dice Row */}
      <div
        id="dice-tray"
        className="flex justify-center items-center gap-2 sm:gap-3.5 py-1"
      >
        {dice.map((die) => (
          <Dice3D
            key={die.id}
            id={die.id}
            value={die.value}
            isHeld={die.isHeld}
            isRolling={die.rolling || isRolling}
            isSuggested={suggestedHolds.includes(die.id) && rollCount > 0 && rollCount < 3}
            disabled={!isPlayerTurn || rollCount === 0 || phase === 'ai_turn'}
            onToggleHold={onToggleHold}
            theme={theme}
          />
        ))}
      </div>

      {/* Smart Action & Auto-Assistant Bar */}
      <div className="mt-2.5 pt-2 border-t border-zinc-500/15 flex flex-col gap-2">
        {/* Auto-Hold Hint Chip if player has open rolls */}
        {isPlayerTurn && rollCount > 0 && rollCount < 3 && suggestedHolds.length > 0 && (
          <div className="flex items-center justify-between gap-2 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-2.5 py-1 text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium truncate">
              💡 {aiEval?.thoughtReason || 'Sugerencia táctica de dados'}
            </span>
            <button
              type="button"
              onClick={() => onAutoHoldSuggested(suggestedHolds)}
              className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded-lg shrink-0 cursor-pointer"
            >
              Fijar Sugeridos
            </button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Main Roll Button */}
          {canRoll && (
            <motion.button
              id="btn-roll-dice"
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onRoll}
              disabled={isRolling}
              className={`
                flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all
                ${
                  rollCount === 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 ring-2 ring-amber-400/40'
                    : 'bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 text-zinc-100 border border-zinc-600'
                }
              `}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>
                {rollCount === 0
                  ? 'Tirar Dados (1/3)'
                  : `Tirar Restantes (${3 - rollCount})`}
              </span>
            </motion.button>
          )}

          {/* 1-Tap Auto-Score Best Category Button */}
          {isPlayerTurn && rollCount > 0 && bestCategoryKey && bestCategoryObj && (
            <motion.button
              id="btn-quick-score"
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onQuickScoreBest(bestCategoryKey)}
              className={`
                flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all
                ${
                  rollCount >= 3 || (bestScoreInfo && bestScoreInfo.points >= 20)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                }
              `}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {bestScoreInfo && bestScoreInfo.points > 0
                  ? `Anotar ${bestCategoryObj.shortName} (+${bestScoreInfo.points} pts)`
                  : `Tachar ${bestCategoryObj.shortName} (0 pts)`}
              </span>
            </motion.button>
          )}

          {!isPlayerTurn && (
            <div className="w-full py-2 text-center text-xs text-purple-500 dark:text-purple-400 font-semibold animate-pulse">
              La IA está jugando su turno...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
