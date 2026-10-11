import React from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  HelpCircle,
  BarChart2,
  RotateCcw,
  Dices,
} from 'lucide-react';

interface GameHeaderProps {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onRestartGame: () => void;
  roundNumber: number;
  totalRounds: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  theme,
  soundEnabled,
  onToggleTheme,
  onToggleSound,
  onOpenRules,
  onOpenStats,
  onRestartGame,
  roundNumber,
  totalRounds,
}) => {
  return (
    <header
      id="main-app-header-compact"
      className={`
        w-full rounded-2xl px-3 py-2 border flex items-center justify-between gap-2 transition-all
        ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
            : 'bg-stone-50/95 border-stone-200 text-stone-900'
        }
      `}
    >
      {/* Brand & Round */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shrink-0">
          <Dices className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black tracking-tight">GENERALA</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            R{Math.min(roundNumber, totalRounds)}/11
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenRules}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 cursor-pointer"
          title="Reglas"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenStats}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-purple-500 cursor-pointer"
          title="Estadísticas"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 cursor-pointer"
          title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 cursor-pointer"
          title="Cambiar tema claro/oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          type="button"
          onClick={onRestartGame}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
          title="Reiniciar partida"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
