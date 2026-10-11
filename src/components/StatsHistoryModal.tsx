import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchHistoryItem } from '../types';
import {
  X,
  BarChart2,
  Trophy,
  Zap,
  Brain,
  Trash2,
  Calendar,
  Award,
} from 'lucide-react';

interface StatsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MatchHistoryItem[];
  onClearHistory: () => void;
  theme: 'dark' | 'light';
}

export const StatsHistoryModal: React.FC<StatsHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  theme,
}) => {
  if (!isOpen) return null;

  const totalMatches = history.length;
  const wins = history.filter((h) => h.won).length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const highestScore = totalMatches > 0 ? Math.max(...history.map((h) => h.playerScore)) : 0;
  const avgIQ =
    totalMatches > 0
      ? Math.round(history.reduce((a, b) => a + (b.cognitiveIQ || 80), 0) / totalMatches)
      : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`
            relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border
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
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Estadísticas e Historial</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Progreso acumulado y rendimiento cognitivo
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

          {/* Stats Overview */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div
                className={`
                  p-3 rounded-2xl border text-center
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Partidas
                </div>
                <div className="text-xl sm:text-2xl font-black mt-0.5">{totalMatches}</div>
              </div>

              <div
                className={`
                  p-3 rounded-2xl border text-center
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Victorias
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-500 mt-0.5">
                  {winRate}%
                </div>
              </div>

              <div
                className={`
                  p-3 rounded-2xl border text-center
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Récord Pts
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-500 mt-0.5">
                  {highestScore}
                </div>
              </div>

              <div
                className={`
                  p-3 rounded-2xl border text-center
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  IQ Promedio
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-500 mt-0.5">
                  {avgIQ || '-'}
                </div>
              </div>
            </div>

            {/* Match History Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Partidas Recientes
                </h4>
                {totalMatches > 0 && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar historial</span>
                  </button>
                )}
              </div>

              {totalMatches === 0 ? (
                <div
                  className={`
                    p-8 rounded-2xl border text-center text-zinc-400
                    ${
                      theme === 'dark'
                        ? 'bg-zinc-850/40 border-zinc-800'
                        : 'bg-stone-50 border-stone-200'
                    }
                  `}
                >
                  <p>Aún no has jugado ninguna partida completa.</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    ¡Termina una partida de 11 rondas para ver tus métricas guardadas!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.map((m) => (
                    <div
                      key={m.id}
                      className={`
                        p-3 rounded-xl border flex items-center justify-between gap-3 text-xs
                        ${
                          theme === 'dark'
                            ? 'bg-zinc-800/40 border-zinc-800'
                            : 'bg-stone-50 border-stone-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`
                            w-2.5 h-2.5 rounded-full
                            ${m.won ? 'bg-emerald-500' : 'bg-purple-500'}
                          `}
                        />
                        <div>
                          <div className="font-bold">
                            {m.won ? 'Victoria' : 'Derrota'} ({m.playerScore} vs {m.aiScore})
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {m.date} • Nivel: {m.difficulty.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          IQ {m.cognitiveIQ}
                        </span>
                        <div className="text-[10px] text-zinc-500">
                          Vel. {m.speedScore}% • Tác. {m.tacticalScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`
              p-4 border-t flex justify-end
              ${
                theme === 'dark'
                  ? 'bg-zinc-850 border-zinc-800'
                  : 'bg-stone-100 border-stone-200'
              }
            `}
          >
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
