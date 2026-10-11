import React from 'react';
import { motion } from 'motion/react';
import { CategoryKey, GamePhase, ScoreCard } from '../types';
import {
  CATEGORIES,
  calculatePotentialScore,
  calculateTotalScore,
} from '../utils/generalaRules';
import { Check, X, Sparkles, Trophy } from 'lucide-react';

interface ScoreTableProps {
  playerScores: ScoreCard;
  aiScores: ScoreCard;
  currentDice: number[];
  rollCount: number;
  phase: GamePhase;
  turnPlayer: 'player' | 'ai';
  onSelectCategory: (category: CategoryKey) => void;
  theme: 'dark' | 'light';
  aiName: string;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  playerScores,
  aiScores,
  currentDice,
  rollCount,
  phase,
  turnPlayer,
  onSelectCategory,
  theme,
  aiName,
}) => {
  const isPlayerTurn = turnPlayer === 'player' && rollCount > 0 && phase !== 'ai_turn';
  const playerTotal = calculateTotalScore(playerScores);
  const aiTotal = calculateTotalScore(aiScores);

  const numberCategories: CategoryKey[] = [
    'ones',
    'twos',
    'threes',
    'fours',
    'fives',
    'sixes',
  ];
  const gameCategories: CategoryKey[] = [
    'escalera',
    'full',
    'poker',
    'generala',
    'doble_generala',
  ];

  const renderCell = (catKey: CategoryKey) => {
    const cat = CATEGORIES.find((c) => c.key === catKey)!;
    const playerEntry = playerScores[catKey];
    const aiEntry = aiScores[catKey];

    const isPlayerFilled = playerEntry !== undefined;
    const isAiFilled = aiEntry !== undefined;

    const potential = isPlayerTurn && !isPlayerFilled
      ? calculatePotentialScore(catKey, currentDice, rollCount, playerScores)
      : null;

    const isPlayable = isPlayerTurn && !isPlayerFilled;

    return (
      <div
        key={catKey}
        id={`score-item-${catKey}`}
        className={`
          flex items-center justify-between p-1.5 sm:p-2 rounded-xl border transition-all text-xs
          ${
            theme === 'dark'
              ? 'bg-zinc-800/50 border-zinc-700/60 text-zinc-200'
              : 'bg-white border-stone-200 text-stone-800'
          }
          ${isPlayable && potential && potential.points > 0 ? (theme === 'dark' ? 'ring-1 ring-emerald-500/50 bg-emerald-950/20' : 'ring-1 ring-emerald-500 bg-emerald-50') : ''}
        `}
      >
        {/* Name */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`
              w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0
              ${
                cat.group === 'juegos'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              }
            `}
          >
            {cat.shortName}
          </span>
          <span className="font-semibold truncate text-[11px] sm:text-xs">
            {cat.name}
          </span>
        </div>

        {/* Scores: Player action button or recorded points vs AI */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Player Cell */}
          {isPlayerFilled ? (
            <span
              className={`
                min-w-[38px] text-center font-bold text-xs py-0.5 px-1.5 rounded-lg
                ${
                  playerEntry.isCrossedOut || playerEntry.points === 0
                    ? 'text-red-500/70 line-through'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                }
              `}
            >
              {playerEntry.points}
              {playerEntry.isServido && <span className="text-[8px] ml-0.5 uppercase">s</span>}
            </span>
          ) : isPlayable && potential ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectCategory(catKey)}
              className={`
                min-w-[42px] py-1 px-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-0.5 cursor-pointer shadow-xs
                ${
                  potential.points > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-400 hover:text-red-500'
                }
              `}
              title={potential.points > 0 ? `Anotar ${potential.points} pts` : 'Tachar casilla (0)'}
            >
              {potential.points > 0 ? (
                <>
                  <span>+{potential.points}</span>
                  {potential.isServido && <Sparkles className="w-2.5 h-2.5 text-amber-300" />}
                </>
              ) : (
                <span className="text-[10px] text-red-500">Tachar</span>
              )}
            </motion.button>
          ) : (
            <span className="min-w-[38px] text-center text-zinc-400 dark:text-zinc-600">-</span>
          )}

          {/* AI Score */}
          <span className="text-[10px] text-zinc-400 font-mono">/</span>
          <span
            className={`
              min-w-[28px] text-center font-bold text-[11px]
              ${
                isAiFilled
                  ? aiEntry.isCrossedOut || aiEntry.points === 0
                    ? 'text-zinc-400 line-through'
                    : 'text-purple-600 dark:text-purple-400'
                  : 'text-zinc-400 dark:text-zinc-600'
              }
            `}
          >
            {isAiFilled ? aiEntry.points : '-'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      id="score-table-compact"
      className={`
        w-full rounded-2xl p-3 sm:p-4 border transition-all duration-200
        ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-lg'
            : 'bg-stone-50/95 border-stone-200 text-stone-900 shadow-md'
        }
      `}
    >
      {/* Mini Scoreboard Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-500/15">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Planilla (Tú / {aiName})</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-emerald-600 dark:text-emerald-400">
            Tú: {playerTotal} pts
          </span>
          <span className="text-zinc-400">|</span>
          <span className="text-purple-600 dark:text-purple-400">
            {aiName}: {aiTotal} pts
          </span>
        </div>
      </div>

      {/* 2-Column Responsive Grid (Section 1: Numbers, Section 2: Major Games) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Numbers Column */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            1. Números (1 al 6)
          </div>
          {numberCategories.map((key) => renderCell(key))}
        </div>

        {/* Major Games Column */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            2. Juegos Mayores
          </div>
          {gameCategories.map((key) => renderCell(key))}
        </div>
      </div>
    </div>
  );
};
