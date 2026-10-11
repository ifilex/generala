import React from 'react';
import { AIPersonality } from '../types';
import { MessageSquare, Sparkles, Cpu } from 'lucide-react';

interface AiCompanionProps {
  personality: AIPersonality;
  thought: string;
  commentary: string;
  isAiThinking: boolean;
  theme: 'dark' | 'light';
  onOpenDifficultyModal: () => void;
}

export const AiCompanion: React.FC<AiCompanionProps> = ({
  personality,
  thought,
  commentary,
  isAiThinking,
  theme,
  onOpenDifficultyModal,
}) => {
  return (
    <div
      id="ai-companion-compact"
      className={`
        w-full rounded-2xl px-3 py-2 border flex items-center justify-between gap-2.5 transition-all
        ${
          theme === 'dark'
            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200'
            : 'bg-stone-50/90 border-stone-200 text-stone-800'
        }
      `}
    >
      {/* Left: Avatar + Difficulty */}
      <button
        type="button"
        onClick={onOpenDifficultyModal}
        className="flex items-center gap-2 text-left cursor-pointer shrink-0 hover:opacity-80"
        title="Cambiar dificultad de la IA"
      >
        <span className="text-xl">{personality.avatar}</span>
        <div>
          <div className="font-bold text-xs leading-none">{personality.name}</div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold leading-tight">
            {personality.title.split(' ')[0]}
          </div>
        </div>
      </button>

      {/* Center: Thought / Dialogue Stream */}
      <div className="flex-1 min-w-0 text-xs px-2 truncate">
        {isAiThinking ? (
          <span className="flex items-center gap-1.5 text-purple-500 font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{thought || 'Calculando probabilidades...'}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <MessageSquare className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="truncate">{commentary || thought || 'Tu turno de tirar.'}</span>
          </span>
        )}
      </div>

      {/* Right: Quick Difficulty Chip */}
      <button
        type="button"
        onClick={onOpenDifficultyModal}
        className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
        title="Configurar IA"
      >
        <Cpu className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
