import React from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles } from 'lucide-react';

interface Dice3DProps {
  id: number;
  value: number;
  isHeld: boolean;
  isRolling: boolean;
  isSuggested?: boolean;
  disabled?: boolean;
  onToggleHold: (id: number) => void;
  theme: 'dark' | 'light';
}

export const Dice3D: React.FC<Dice3DProps> = ({
  id,
  value,
  isHeld,
  isRolling,
  isSuggested = false,
  disabled = false,
  onToggleHold,
  theme,
}) => {
  const renderPips = (val: number) => {
    const dotClasses =
      theme === 'dark' ? 'bg-zinc-900 shadow-inner' : 'bg-red-600 shadow-xs';

    switch (val) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div
              className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full ${
                theme === 'dark' ? 'bg-red-500' : 'bg-red-600'
              } shadow-sm`}
            />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2 sm:p-2.5">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses} self-start`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2 sm:p-2.5">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses} self-start`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses} self-center`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-2 sm:p-2.5 justify-items-center items-center">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2 sm:p-2.5">
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full justify-items-center items-center">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                  theme === 'dark' ? 'bg-red-500' : 'bg-red-600'
                } shadow-sm`}
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 grid-rows-3 w-full h-full p-1.5 sm:p-2 justify-items-center items-center">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClasses}`} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center select-none" id={`die-wrapper-${id}`}>
      <motion.button
        id={`die-btn-${id}`}
        type="button"
        disabled={disabled || isRolling}
        onClick={() => onToggleHold(id)}
        whileHover={!disabled && !isRolling ? { scale: 1.05, y: -2 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720],
                rotateY: [0, -180, -360],
                scale: [1, 1.15, 0.95, 1],
                y: [0, -20, 5, 0],
              }
            : {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                y: isHeld ? -4 : 0,
              }
        }
        transition={
          isRolling
            ? { duration: 0.5, ease: 'easeOut' }
            : { type: 'spring', stiffness: 400, damping: 25 }
        }
        className={`
          relative w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl sm:rounded-2xl cursor-pointer
          transition-all duration-150 focus:outline-none
          ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-zinc-100 to-zinc-300 text-zinc-900 border border-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.8)]'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-950 border border-amber-200 shadow-[0_4px_12px_rgba(180,120,60,0.2),inset_0_1px_3px_rgba(255,255,255,0.9)]'
          }
          ${
            isHeld
              ? 'ring-3 ring-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.5)] transform -translate-y-1'
              : isSuggested
              ? 'ring-2 ring-emerald-400 ring-dashed'
              : 'hover:border-amber-400'
          }
          ${disabled ? 'opacity-80 cursor-default' : 'active:shadow-inner'}
        `}
        aria-label={`Dado ${id + 1}, valor ${value}, ${isHeld ? 'retenido' : 'libre'}`}
      >
        {renderPips(value)}

        {isHeld && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-zinc-950 p-0.5 rounded-full shadow-xs flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}

        {isSuggested && !isHeld && !disabled && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        )}
      </motion.button>

      {/* Held indicator label */}
      <span className="text-[10px] font-bold mt-1 text-center h-3.5 leading-none">
        {isHeld ? (
          <span className="text-amber-500">Fijo</span>
        ) : isSuggested && !disabled ? (
          <span className="text-emerald-500 font-semibold text-[9px]">Sugerido</span>
        ) : null}
      </span>
    </div>
  );
};
