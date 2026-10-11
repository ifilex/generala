import React from 'react';
import { CognitiveProfile } from '../types';
import { Brain, Zap, Target, Award } from 'lucide-react';

interface CognitiveRadarProps {
  profile: CognitiveProfile;
  theme: 'dark' | 'light';
}

export const CognitiveRadar: React.FC<CognitiveRadarProps> = ({ profile, theme }) => {
  const { speedScore, tacticalScore, cognitionScore, riskProfile } = profile;

  const cognitiveIQ = Math.round(
    cognitionScore * 0.35 + tacticalScore * 0.35 + speedScore * 0.2 + profile.adaptabilityScore * 0.1
  );

  return (
    <div
      id="cognitive-radar-mini"
      className={`
        w-full rounded-2xl px-3 py-2 border flex items-center justify-between gap-2 text-xs transition-all
        ${
          theme === 'dark'
            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200 shadow-xs'
            : 'bg-stone-50/90 border-stone-200 text-stone-800 shadow-xs'
        }
      `}
    >
      {/* 3 Quick Pill Metrics */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] text-zinc-500">Vel:</span>
          <strong className="font-mono text-amber-500 font-bold">{speedScore}%</strong>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Target className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] text-zinc-500">Tác:</span>
          <strong className="font-mono text-emerald-500 font-bold">{tacticalScore}%</strong>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Brain className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-[11px] text-zinc-500">Cog:</span>
          <strong className="font-mono text-purple-500 font-bold">{cognitionScore}%</strong>
        </div>
      </div>

      {/* IQ & Profile Badge */}
      <div className="flex items-center gap-1.5 shrink-0 text-right">
        <Award className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-semibold hidden sm:inline text-zinc-400">
          {riskProfile} •
        </span>
        <span className="text-xs font-black text-purple-600 dark:text-purple-400">
          IQ {cognitiveIQ}
        </span>
      </div>
    </div>
  );
};
