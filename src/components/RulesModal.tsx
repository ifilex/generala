import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, Check, Flame } from 'lucide-react';
import { CATEGORIES } from '../utils/generalaRules';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`
            relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border
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
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Reglas Oficiales de la Generala</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Reglamento tradicional latinoamericano con bonificación de Servido
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

          {/* Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed">
            {/* Dinámica de Turno */}
            <div
              className={`
                p-4 rounded-2xl border
                ${
                  theme === 'dark'
                    ? 'bg-zinc-800/40 border-zinc-700/60'
                    : 'bg-stone-50 border-stone-200'
                }
              `}
            >
              <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-1.5 text-sm">
                <span>1. Dinámica del Turno (3 Tiros)</span>
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-zinc-600 dark:text-zinc-300">
                <li>En cada ronda, tienes hasta <strong>3 tiros de dados</strong>.</li>
                <li>En el 1er tiro se lanzan los 5 dados. Puedes <strong>retener (fijar)</strong> los dados que te sirvan y volver a tirar los restantes en el 2do y 3er tiro.</li>
                <li>Puedes deseleccionar dados retenidos en cualquier momento antes de tirar.</li>
                <li>Al finalizar tus tiros (o antes si ya estás satisfecho), debes <strong>elegir una categoría en la planilla</strong> para anotar o tachar.</li>
              </ul>
            </div>

            {/* Bonificación por Servido */}
            <div
              className={`
                p-4 rounded-2xl border bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30
              `}
            >
              <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>2. ¿Qué es una jugada "Servida"?</span>
              </h4>
              <p className="text-zinc-700 dark:text-zinc-200">
                Si logras una combinación mayor (Escalera, Full, Póker o Generala) en el <strong>primer tiro</strong> (sin haber retenido ni vuelto a tirar ningún dado), se considera <strong>Servida</strong> y otorga una bonificación de <strong>+5 puntos</strong> (+10 pts en Generala y +20 pts en Doble Generala).
              </p>
            </div>

            {/* Puntuaciones de Juegos Mayores */}
            <div>
              <h4 className="font-bold mb-3 text-sm">3. Tabla de Puntuaciones Oficiales</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.key}
                    className={`
                      p-2.5 rounded-xl border flex items-start justify-between gap-2
                      ${
                        theme === 'dark'
                          ? 'bg-zinc-800/30 border-zinc-800'
                          : 'bg-stone-50 border-stone-200'
                      }
                    `}
                  >
                    <div>
                      <div className="font-bold text-xs">{cat.name}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {cat.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {cat.standardPoints} pts
                      </div>
                      {cat.servidoPoints && (
                        <div className="text-[10px] text-amber-500 font-semibold">
                          Servido: {cat.servidoPoints}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tachar Casillas */}
            <div
              className={`
                p-4 rounded-2xl border
                ${
                  theme === 'dark'
                    ? 'bg-zinc-800/40 border-zinc-700/60'
                    : 'bg-stone-50 border-stone-200'
                }
              `}
            >
              <h4 className="font-bold text-rose-500 mb-1 flex items-center gap-1 text-sm">
                <span>4. Casillas Tachadas (0 Puntos)</span>
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Si al terminar los 3 tiros no lograste ninguna combinación útil o las casillas ya están ocupadas, deberás <strong>tachar una casilla libre</strong> con 0 puntos. Consejo estratégico: suele ser conveniente tachar los <em>Unos</em> o la <em>Doble Generala</em> para no quemar juegos mayores.
              </p>
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm cursor-pointer shadow-md"
            >
              ¡Entendido, a Jugar!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
