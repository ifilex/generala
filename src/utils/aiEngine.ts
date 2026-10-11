import { AIDifficulty, AIPersonality, CategoryKey, ScoreCard } from '../types';
import {
  CATEGORIES,
  calculatePotentialScore,
  getDiceCounts,
  isEscalera,
  isFull,
  isGenerala,
  isPoker,
} from './generalaRules';

export const AI_PERSONALITIES: Record<AIDifficulty, AIPersonality> = {
  facil: {
    id: 'facil',
    name: 'Mateo',
    title: 'Principiante Casual',
    avatar: '🎲',
    description: 'Juega por diversión e intuición. Comete errores tácticos ocasionales.',
    style: 'Relajado e intuitivo',
    avatarBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  medio: {
    id: 'medio',
    name: 'Camila',
    title: 'Estratega Equilibrada',
    avatar: '🎯',
    description: 'Conoce bien las reglas y optimiza sus tiradas buscando combinaciones sólidas.',
    style: 'Táctica y calculadora',
    avatarBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  dificil: {
    id: 'dificil',
    name: 'Cortex AI',
    title: 'Maestro Probabilístico',
    avatar: '🧠',
    description: 'Calcula el valor esperado (EV) y ajusta su riesgo según la diferencia de puntos.',
    style: 'Matemático implacable',
    avatarBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
};

export interface AIDecision {
  heldDiceIndices: number[]; // 0 to 4 indices to keep
  shouldReroll: boolean;
  chosenCategory?: CategoryKey;
  thoughtReason: string;
}

// Find open categories
export function getOpenCategories(scores: ScoreCard): CategoryKey[] {
  return CATEGORIES.map((c) => c.key).filter((k) => scores[k] === undefined);
}

// Check which dice to hold for Escalera pursuit
function getEscaleraHolds(dice: number[]): number[] {
  // Check patterns: 12345, 23456, 13456
  const targetPatterns = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [1, 3, 4, 5, 6],
  ];

  let bestHoldIndices: number[] = [];
  let maxMatch = 0;

  for (const pattern of targetPatterns) {
    const indices: number[] = [];
    const usedDice = new Set<number>();

    for (const val of pattern) {
      const dieIdx = dice.findIndex((d, idx) => d === val && !usedDice.has(idx));
      if (dieIdx !== -1) {
        indices.push(dieIdx);
        usedDice.add(dieIdx);
      }
    }

    if (indices.length > maxMatch) {
      maxMatch = indices.length;
      bestHoldIndices = indices;
    }
  }

  return maxMatch >= 3 ? bestHoldIndices : [];
}

// Calculate the best action for AI
export function determineAIDecision(
  dice: number[],
  rollNumber: number,
  aiScores: ScoreCard,
  playerScores: ScoreCard,
  difficulty: AIDifficulty
): AIDecision {
  const openCategories = getOpenCategories(aiScores);
  const counts = getDiceCounts(dice);

  // If already at roll 3, must choose a category
  if (rollNumber >= 3) {
    return {
      heldDiceIndices: [0, 1, 2, 3, 4],
      shouldReroll: false,
      chosenCategory: pickBestCategoryToScore(dice, rollNumber, aiScores, difficulty),
      thoughtReason: 'Tercer tiro completado. Seleccionando la mejor categoría disponible en la planilla.',
    };
  }

  // Check if we already have a top game servido or completed
  const hasGenerala = isGenerala(dice);
  const hasPoker = isPoker(dice);
  const hasFull = isFull(dice);
  const hasEscalera = isEscalera(dice);

  // 1. Generala achieved
  if (hasGenerala) {
    if (openCategories.includes('generala')) {
      return {
        heldDiceIndices: [0, 1, 2, 3, 4],
        shouldReroll: false,
        chosenCategory: 'generala',
        thoughtReason: '¡Generala conseguida! Anotando máxima puntuación de inmediato.',
      };
    } else if (openCategories.includes('doble_generala') && (aiScores.generala?.points ?? 0) > 0) {
      return {
        heldDiceIndices: [0, 1, 2, 3, 4],
        shouldReroll: false,
        chosenCategory: 'doble_generala',
        thoughtReason: '¡Doble Generala conseguida! Anotando 100+ puntos.',
      };
    }
  }

  // 2. Poker achieved
  if (hasPoker && openCategories.includes('poker')) {
    if (difficulty === 'facil' || rollNumber >= 2) {
      return {
        heldDiceIndices: [0, 1, 2, 3, 4],
        shouldReroll: false,
        chosenCategory: 'poker',
        thoughtReason: '¡Póker asegurado! Anotando en la categoría de Póker.',
      };
    }
    // Cortex AI might gamble on roll 1 if Generala is open and Poker is already achieved
    if (difficulty === 'dificil' && openCategories.includes('generala') && rollNumber === 1) {
      // Find the 4 matching dice and roll the 5th for Generala!
      let fourVal = 0;
      for (const [valStr, c] of Object.entries(counts)) {
        if (c >= 4) fourVal = Number(valStr);
      }
      const holds = dice.map((d, i) => (d === fourVal ? i : -1)).filter((i) => i !== -1).slice(0, 4);
      return {
        heldDiceIndices: holds,
        shouldReroll: true,
        thoughtReason: 'Tengo Póker servido, pero arriesgo el quinto dado para buscar la Generala.',
      };
    }
  }

  // 3. Full achieved
  if (hasFull && openCategories.includes('full')) {
    return {
      heldDiceIndices: [0, 1, 2, 3, 4],
      shouldReroll: false,
      chosenCategory: 'full',
      thoughtReason: '¡Full conseguido! Asegurando los puntos.',
    };
  }

  // 4. Escalera achieved
  if (hasEscalera && openCategories.includes('escalera')) {
    return {
      heldDiceIndices: [0, 1, 2, 3, 4],
      shouldReroll: false,
      chosenCategory: 'escalera',
      thoughtReason: '¡Escalera lograda! Asegurando la jugada.',
    };
  }

  // If difficulty is 'facil', simulate casual intuition
  if (difficulty === 'facil') {
    // Hold most frequent dice
    let maxCount = 0;
    let mostFrequentVal = dice[0];
    for (const [v, c] of Object.entries(counts)) {
      if (c > maxCount) {
        maxCount = c;
        mostFrequentVal = Number(v);
      }
    }

    if (maxCount >= 2) {
      const holds = dice.map((d, i) => (d === mostFrequentVal ? i : -1)).filter((i) => i !== -1);
      return {
        heldDiceIndices: holds,
        shouldReroll: true,
        thoughtReason: `Mantengo mis ${maxCount} dados de ${mostFrequentVal} y tiro el resto por instinto.`,
      };
    }

    // Otherwise keep highest die
    const maxDie = Math.max(...dice);
    const firstMaxIdx = dice.indexOf(maxDie);
    return {
      heldDiceIndices: [firstMaxIdx],
      shouldReroll: true,
      thoughtReason: `Guardo el dado mayor (${maxDie}) y vuelvo a tirar.`,
    };
  }

  // Medium / Hard heuristic and EV decision
  // Check Escalera potential
  if (openCategories.includes('escalera')) {
    const escHolds = getEscaleraHolds(dice);
    if (escHolds.length >= 4) {
      return {
        heldDiceIndices: escHolds,
        shouldReroll: true,
        thoughtReason: 'Tengo 4 dados para Escalera. Busco el faltante en este tiro.',
      };
    }
  }

  // Check group counts (pairs, triplets, quads)
  let bestVal = 0;
  let bestCount = 0;
  for (const [valStr, c] of Object.entries(counts)) {
    const val = Number(valStr);
    if (c > bestCount || (c === bestCount && val > bestVal)) {
      bestCount = c;
      bestVal = val;
    }
  }

  // Look for two pairs (for Full House)
  if (openCategories.includes('full')) {
    const pairs = Object.entries(counts)
      .filter(([_, c]) => c === 2)
      .map(([v, _]) => Number(v));
    if (pairs.length === 2) {
      const holds = dice.map((d, i) => (pairs.includes(d) ? i : -1)).filter((i) => i !== -1);
      return {
        heldDiceIndices: holds,
        shouldReroll: true,
        thoughtReason: `Mantengo doble par (${pairs[0]} y ${pairs[1]}) buscando el Full en el último dado.`,
      };
    }
  }

  if (bestCount >= 2) {
    const holds = dice.map((d, i) => (d === bestVal ? i : -1)).filter((i) => i !== -1);
    return {
      heldDiceIndices: holds,
      shouldReroll: true,
      thoughtReason: `Mantengo ${bestCount} dados de ${bestVal} buscando potenciar Póker, Full o ${bestVal}es.`,
    };
  }

  // If no pair, and we have open high number categories, keep highest single dice
  const openNumbers = ([6, 5, 4, 3, 2, 1] as const).filter((num) => {
    const keyMap: Record<number, CategoryKey> = {
      1: 'ones',
      2: 'twos',
      3: 'threes',
      4: 'fours',
      5: 'fives',
      6: 'sixes',
    };
    return openCategories.includes(keyMap[num]);
  });

  if (openNumbers.length > 0) {
    const highestTarget = openNumbers[0];
    const holds = dice.map((d, i) => (d === highestTarget ? i : -1)).filter((i) => i !== -1);
    if (holds.length > 0) {
      return {
        heldDiceIndices: holds,
        shouldReroll: true,
        thoughtReason: `Reservando dados de ${highestTarget} para la categoría de ${highestTarget}es.`,
      };
    }
  }

  // Fallback: hold the highest die
  const maxVal = Math.max(...dice);
  const maxIdx = dice.indexOf(maxVal);
  return {
    heldDiceIndices: [maxIdx],
    shouldReroll: true,
    thoughtReason: `Tirando de nuevo buscando mejores combinaciones.`,
  };
}

// Pick best category to score at roll 3 or end of turn
export function pickBestCategoryToScore(
  dice: number[],
  rollNumber: number,
  scores: ScoreCard,
  difficulty: AIDifficulty
): CategoryKey {
  const openCategories = getOpenCategories(scores);
  if (openCategories.length === 0) return 'ones';

  // Evaluate candidate scores
  const candidates = openCategories.map((key) => {
    const result = calculatePotentialScore(key, dice, rollNumber, scores);
    return {
      key,
      points: result.points,
      isValid: result.isValid,
      isServido: result.isServido,
    };
  });

  // 1. If valid Generala or Doble Generala, pick immediately
  const generala = candidates.find((c) => c.key === 'generala' && c.points > 0);
  if (generala) return 'generala';

  const dobleGen = candidates.find((c) => c.key === 'doble_generala' && c.points > 0);
  if (dobleGen) return 'doble_generala';

  // 2. If valid Major game with points, prioritize by highest points
  const validGames = candidates
    .filter((c) => ['poker', 'full', 'escalera'].includes(c.key) && c.points > 0)
    .sort((a, b) => b.points - a.points);
  if (validGames.length > 0) {
    return validGames[0].key;
  }

  // 3. Number categories with good score (e.g. at least 3 matching dice or high sum)
  const validNumbers = candidates
    .filter((c) => ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].includes(c.key) && c.points > 0)
    .sort((a, b) => b.points - a.points);

  if (validNumbers.length > 0) {
    // If difficulty is hard, only put in number if decent (e.g. >= 2 dice)
    if (difficulty !== 'facil') {
      const topNumber = validNumbers[0];
      return topNumber.key;
    }
    return validNumbers[0].key;
  }

  // 4. If no good category scored points > 0, we must cross out (tachado = 0)
  // Smart sacrifice hierarchy:
  // Usually cross out 1s (ones) first because maximum lost is only 5 points!
  // Then Doble Generala if no Generala exists, then 2s, then Generala (if impossible), etc.
  const sacrificePriority: CategoryKey[] = [
    'ones',
    'doble_generala',
    'twos',
    'generala',
    'threes',
    'escalera',
    'fours',
    'full',
    'poker',
    'fives',
    'sixes',
  ];

  for (const sacrificialKey of sacrificePriority) {
    if (openCategories.includes(sacrificialKey)) {
      return sacrificialKey;
    }
  }

  return openCategories[0];
}

// Generate contextual AI speech
export function generateAICommentary(
  event: 'roll' | 'player_combo' | 'ai_combo' | 'zero_sacrifice' | 'game_end',
  personality: AIPersonality,
  detail?: { category?: string; points?: number; won?: boolean }
): string {
  switch (event) {
    case 'player_combo':
      if (personality.id === 'facil') {
        return `¡Uff, tremenda jugada con ${detail?.category || 'esos dados'}! 👏`;
      } else if (personality.id === 'medio') {
        return `Buena elección táctica para ${detail?.category || 'anotar'}. Tengo que remontar.`;
      } else {
        return `Calculada con precisión. Tu valor esperado en ${detail?.category || 'la jugada'} fue óptimo.`;
      }

    case 'ai_combo':
      if (personality.id === 'facil') {
        return `¡Sí! ¡Mira esos dados, qué buena suerte me tocó! 🎉`;
      } else if (personality.id === 'medio') {
        return `La probabilidad estaba de mi lado en esta tirada. ${detail?.points || ''} puntos a la planilla.`;
      } else {
        return `Secuencia ejecutada según el modelo probabilístico. +${detail?.points || ''} puntos calculados.`;
      }

    case 'zero_sacrifice':
      if (personality.id === 'facil') {
        return `A veces toca tachar una casilla... ¡en la próxima nos va mejor!`;
      } else if (personality.id === 'medio') {
        return `Tachar ${detail?.category || 'la categoría'} fue un sacrificio calculado para salvar las mejores casillas.`;
      } else {
        return `Minimización de pérdidas: sacrificar ${detail?.category || 'la categoría'} preserva el EV de la partida.`;
      }

    case 'game_end':
      if (detail?.won) {
        return personality.id === 'facil'
          ? '¡Increíble partida! Me ganaste muy bien, ¡felicitaciones! 🏆'
          : personality.id === 'medio'
          ? 'Gran rendimiento cognitivo y velocidad. ¡Una victoria bien merecida!'
          : 'Partida concluida. Tu índice táctico superó mi algoritmo hoy. Excelente estrategia.';
      } else {
        return personality.id === 'facil'
          ? '¡Gané esta vez! Fue una partida muy divertida y reñida.'
          : personality.id === 'medio'
          ? 'Logré mantener la ventaja en los juegos mayores. ¡Revancha cuando quieras!'
          : 'Victoria matemática lograda. Analizando tus métricas para que mejores en la próxima.';
      }

    default:
      return 'Tirando los dados...';
  }
}
