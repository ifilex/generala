import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CognitiveProfile, ScoreCard } from '../types';
import { calculateTotalScore } from '../utils/generalaRules';
import {
  Trophy,
  Brain,
  Zap,
  Target,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Activity,
  Flame,
} from 'lucide-react';

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onOpenStats: () => void;
  playerScores: ScoreCard;
  aiScores: ScoreCard;
  aiName: string;
  cognitiveProfile: CognitiveProfile;
  theme: 'dark' | 'light';
}

export const PostGameModal: React.FC<PostGameModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onOpenStats,
  playerScores,
  aiScores,
  aiName,
  cognitiveProfile,
  theme,
}) => {
  const playerTotal = calculateTotalScore(playerScores);
  const aiTotal = calculateTotalScore(aiScores);
  const isWinner = playerTotal > aiTotal;
  const isTie = playerTotal === aiTotal;

  const {
    speedScore,
    tacticalScore,
    cognitionScore,
    adaptabilityScore,
    riskProfile,
    averageDecisionTimeMs,
    optimalDecisionsRate,
    pointsPerRoll,
    feedbackTips,
  } = cognitiveProfile;

  const cognitiveIQ = Math.round(
    cognitionScore * 0.35 + tacticalScore * 0.35 + speedScore * 0.2 + adaptabilityScore * 0.1
  );

  useEffect(() => {
    if (isOpen && isWinner) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, isWinner]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`
            relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border my-auto
            ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                : 'bg-white border-stone-200 text-stone-900'
            }
          `}
        >
          {/* Header Banner */}
          <div
            className={`
              p-6 text-center relative overflow-hidden
              ${
                isWinner
                  ? 'bg-gradient-to-b from-amber-500/30 via-emerald-500/20 to-transparent border-b border-amber-500/30'
                  : isTie
                  ? 'bg-gradient-to-b from-blue-500/20 to-transparent border-b border-blue-500/30'
                  : 'bg-gradient-to-b from-purple-500/20 to-transparent border-b border-purple-500/30'
              }
            `}
          >
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-500 mb-2 border border-amber-500/30">
              {isWinner ? (
                <Trophy className="w-8 h-8" />
              ) : (
                <Brain className="w-8 h-8 text-purple-500" />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              {isWinner ? '¡Victoria Magistral!' : isTie ? '¡Empate Épico!' : '¡Buen Juego! Partida Concluida'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {isWinner
                ? `Superaste a ${aiName} con una excelente estrategia y agilidad.`
                : `${aiName} se llevó esta partida por un margen estrecho.`}
            </p>

            {/* Final Score Board */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Tu Puntaje
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-500 font-mono">
                  {playerTotal}
                </div>
              </div>

              <div className="text-lg font-bold text-zinc-400">vs</div>

              <div className="text-center">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {aiName}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-purple-500 font-mono">
                  {aiTotal}
                </div>
              </div>
            </div>
          </div>

          {/* Cognitive Assessment Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {/* Cognitive Index Banner */}
            <div
              className={`
                p-4 rounded-2xl border flex items-center justify-between gap-3
                ${
                  theme === 'dark'
                    ? 'bg-zinc-850/80 border-purple-500/30'
                    : 'bg-purple-50/70 border-purple-200'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500 text-white font-bold">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Evaluación de Rendimiento Cognitivo
                  </div>
                  <div className="text-sm font-semibold">
                    Perfil Mental: <strong className="text-amber-500">{riskProfile}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  {cognitiveIQ}
                  <span className="text-xs text-zinc-400 font-normal"> /100</span>
                </div>
              </div>
            </div>

            {/* 3 Pillars Metrics Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Velocidad */}
              <div
                className={`
                  p-3.5 rounded-2xl border
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Velocidad de Reacción</span>
                </div>
                <div className="text-xl font-extrabold">{speedScore}%</div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Promedio: <strong>{(averageDecisionTimeMs / 1000).toFixed(1)}s</strong> por decisión
                </div>
              </div>

              {/* Acción y Táctica */}
              <div
                className={`
                  p-3.5 rounded-2xl border
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1">
                  <Target className="w-4 h-4" />
                  <span>Acción & Táctica</span>
                </div>
                <div className="text-xl font-extrabold">{tacticalScore}%</div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Rendimiento: <strong>{pointsPerRoll}</strong> pts por tiro
                </div>
              </div>

              {/* Cognición & EV */}
              <div
                className={`
                  p-3.5 rounded-2xl border
                  ${
                    theme === 'dark'
                      ? 'bg-zinc-800/40 border-zinc-700'
                      : 'bg-stone-50 border-stone-200'
                  }
                `}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500 mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Cognición & EV</span>
                </div>
                <div className="text-xl font-extrabold">{cognitionScore}%</div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Toma óptima: <strong>{optimalDecisionsRate}%</strong>
                </div>
              </div>
            </div>

            {/* Coach Insights */}
            <div
              className={`
                p-4 rounded-2xl border
                ${
                  theme === 'dark'
                    ? 'bg-zinc-800/30 border-zinc-800'
                    : 'bg-stone-50 border-stone-200'
                }
              `}
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Consejos del Entrenador Cognitivo</span>
              </h4>
              <ul className="space-y-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {feedbackTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className={`
              p-4 border-t flex flex-wrap items-center justify-between gap-2.5
              ${
                theme === 'dark'
                  ? 'bg-zinc-850 border-zinc-800'
                  : 'bg-stone-100 border-stone-200'
              }
            `}
          >
            <button
              type="button"
              onClick={onOpenStats}
              className={`
                px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer
                ${
                  theme === 'dark'
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                    : 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300'
                }
              `}
            >
              Ver Historial Completo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar Revancha</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
