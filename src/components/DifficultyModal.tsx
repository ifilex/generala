import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AIDifficulty, AIPersonality } from '../types';
import { AI_PERSONALITIES } from '../utils/aiEngine';
import { X, Cpu, Check, Zap, Sparkles } from 'lucide-react';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: AIDifficulty;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  aiSpeed: 'instant' | 'fast' | 'normal';
  onSelectSpeed: (speed: 'instant' | 'fast' | 'normal') => void;
  theme: 'dark' | 'light';
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
  onSelectDifficulty,
  aiSpeed,
  onSelectSpeed,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`
            relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border
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
              p-4 sm:p-5 border-b flex items-center justify-between
              ${
                theme === 'dark'
                  ? 'bg-zinc-850 border-zinc-800'
                  : 'bg-stone-100 border-stone-200'
              }
            `}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Oponentes de Inteligencia Artificial</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Selecciona la personalidad y el nivel de desafío táctico
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              {(Object.values(AI_PERSONALITIES) as AIPersonality[]).map((p) => {
                const isSelected = currentDifficulty === p.id;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectDifficulty(p.id);
                      onClose();
                    }}
                    className={`
                      w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer
                      ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
                          : theme === 'dark'
                          ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/80'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border
                        ${p.avatarBg}
                      `}
                    >
                      {p.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm sm:text-base">{p.name}</div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {p.title}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {p.description}
                      </p>
                      <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-1">
                        Estilo: {p.style}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-purple-500 text-white self-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* AI Turn Speed */}
            <div
              className={`
                p-3.5 rounded-2xl border mt-4
                ${
                  theme === 'dark'
                    ? 'bg-zinc-800/30 border-zinc-800'
                    : 'bg-stone-50 border-stone-200'
                }
              `}
            >
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Velocidad de Turno de la IA</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal (1.5s)' },
                  { id: 'fast', label: 'Rápido (0.8s)' },
                  { id: 'instant', label: 'Ultra (0.3s)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSpeed(s.id as 'instant' | 'fast' | 'normal')}
                    className={`
                      py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border
                      ${
                        aiSpeed === s.id
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-xs'
                          : theme === 'dark'
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                          : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                      }
                    `}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
