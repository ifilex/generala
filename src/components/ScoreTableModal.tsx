import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryKey, GamePhase, ScoreCard } from '../types';
import {
  CATEGORIES,
  calculatePotentialScore,
  calculateTotalScore,
} from '../utils/generalaRules';
import { X, Trophy, Sparkles, Check } from 'lucide-react';

interface ScoreTableModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const ScoreTableModal: React.FC<ScoreTableModalProps> = ({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

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

  const handleScore = (catKey: CategoryKey) => {
    onSelectCategory(catKey);
    onClose();
  };

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
        id={`sheet-cat-${catKey}`}
        className={`
          flex items-center justify-between p-2 rounded-xl border transition-all text-xs
          ${
            theme === 'dark'
              ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200'
              : 'bg-stone-50 border-stone-200 text-stone-800'
          }
          ${
            isPlayable && potential && potential.points > 0
              ? theme === 'dark'
                ? 'ring-1 ring-emerald-500/50 bg-emerald-950/25'
                : 'ring-1 ring-emerald-500 bg-emerald-50'
              : ''
          }
        `}
      >
        {/* Name */}
        <div className="flex items-center gap-2 min-w-0">
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
          <div>
            <div className="font-semibold text-xs leading-none">{cat.name}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              {cat.servidoPoints ? `${cat.standardPoints}/${cat.servidoPoints}*` : `${cat.standardPoints}`}
            </div>
          </div>
        </div>

        {/* Scores: Player action button vs AI */}
        <div className="flex items-center gap-2 shrink-0">
          {isPlayerFilled ? (
            <span
              className={`
                min-w-[42px] text-center font-bold text-xs py-1 px-2 rounded-lg
                ${
                  playerEntry.isCrossedOut || playerEntry.points === 0
                    ? 'text-red-500 line-through bg-red-500/10'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15'
                }
              `}
            >
              {playerEntry.points}
              {playerEntry.isServido && <span className="text-[8px] ml-0.5 uppercase">s</span>}
            </span>
          ) : isPlayable && potential ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleScore(catKey)}
              className={`
                min-w-[46px] py-1 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs
                ${
                  potential.points > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-400'
                }
              `}
            >
              {potential.points > 0 ? (
                <>
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>+{potential.points}</span>
                </>
              ) : (
                <span className="text-[10px] text-red-500">Tachar</span>
              )}
            </motion.button>
          ) : (
            <span className="min-w-[42px] text-center text-zinc-400 font-mono text-xs">-</span>
          )}

          {/* AI Score Column */}
          <span className="text-[10px] text-zinc-400 font-mono">/</span>
          <span
            className={`
              min-w-[32px] text-center font-bold text-xs
              ${
                isAiFilled
                  ? aiEntry.isCrossedOut || aiEntry.points === 0
                    ? 'text-zinc-400 line-through'
                    : 'text-purple-600 dark:text-purple-400'
                  : 'text-zinc-400'
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`
            relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border
            ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                : 'bg-white border-stone-200 text-stone-900'
            }
          `}
        >
          {/* Header */}
          <div
            className={`
              p-3.5 sm:p-4 border-b flex items-center justify-between
              ${
                theme === 'dark'
                  ? 'bg-zinc-850 border-zinc-800'
                  : 'bg-stone-100 border-stone-200'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">Planilla de Anotación</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Tú: {playerTotal} pts
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {aiName}: {aiTotal} pts
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
            {/* Number Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                1. Números (1 al 6)
              </div>
              {numberCategories.map((key) => renderCell(key))}
            </div>

            {/* Games Section */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                2. Juegos Mayores
              </div>
              {gameCategories.map((key) => renderCell(key))}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`
              p-3 border-t flex items-center justify-between text-xs
              ${
                theme === 'dark'
                  ? 'bg-zinc-850 border-zinc-800'
                  : 'bg-stone-100 border-stone-200'
              }
            `}
          >
            <span className="text-[11px] text-zinc-400">
              * Servido: +5 pts en 1er tiro
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold cursor-pointer"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
