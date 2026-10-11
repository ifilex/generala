import { CategoryInfo, CategoryKey, ScoreCard } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'ones',
    name: 'Unos (1)',
    shortName: '1',
    description: 'Suma de todos los dados con valor 1',
    standardPoints: 'Suma de 1s',
    group: 'numeros',
  },
  {
    key: 'twos',
    name: 'Doses (2)',
    shortName: '2',
    description: 'Suma de todos los dados con valor 2',
    standardPoints: 'Suma de 2s',
    group: 'numeros',
  },
  {
    key: 'threes',
    name: 'Treses (3)',
    shortName: '3',
    description: 'Suma de todos los dados con valor 3',
    standardPoints: 'Suma de 3s',
    group: 'numeros',
  },
  {
    key: 'fours',
    name: 'Cuatros (4)',
    shortName: '4',
    description: 'Suma de todos los dados con valor 4',
    standardPoints: 'Suma de 4s',
    group: 'numeros',
  },
  {
    key: 'fives',
    name: 'Cincos (5)',
    shortName: '5',
    description: 'Suma de todos los dados con valor 5',
    standardPoints: 'Suma de 5s',
    group: 'numeros',
  },
  {
    key: 'sixes',
    name: 'Seises (6)',
    shortName: '6',
    description: 'Suma de todos los dados con valor 6',
    standardPoints: 'Suma de 6s',
    group: 'numeros',
  },
  {
    key: 'escalera',
    name: 'Escalera',
    shortName: 'ESC',
    description: '5 dados consecutivos (1-2-3-4-5, 2-3-4-5-6 o 3-4-5-6-1 al As)',
    standardPoints: 20,
    servidoPoints: 25,
    group: 'juegos',
  },
  {
    key: 'full',
    name: 'Full',
    shortName: 'FULL',
    description: '3 dados de un valor y 2 de otro valor (o 5 iguales)',
    standardPoints: 30,
    servidoPoints: 35,
    group: 'juegos',
  },
  {
    key: 'poker',
    name: 'Póker',
    shortName: 'POK',
    description: '4 dados con el mismo valor (o 5 iguales)',
    standardPoints: 40,
    servidoPoints: 45,
    group: 'juegos',
  },
  {
    key: 'generala',
    name: 'Generala',
    shortName: 'GEN',
    description: '5 dados con el mismo valor (50 pts / 60 servida)',
    standardPoints: 50,
    servidoPoints: 60,
    group: 'juegos',
  },
  {
    key: 'doble_generala',
    name: 'Doble Generala',
    shortName: '2xGEN',
    description: 'Segunda Generala del juego (100 pts / 120 servida)',
    standardPoints: 100,
    servidoPoints: 120,
    group: 'juegos',
  },
];

export function getDiceCounts(dice: number[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const val of dice) {
    if (counts[val] !== undefined) {
      counts[val]++;
    }
  }
  return counts;
}

export function isEscalera(dice: number[]): boolean {
  if (!dice || dice.length !== 5) return false;
  const sorted = [...dice].sort((a, b) => a - b);
  const str = sorted.join('');

  // 1-2-3-4-5 (Menor)
  // 2-3-4-5-6 (Mayor)
  // 1-3-4-5-6 (3-4-5-6-1 al As con vuelta)
  // 1-2-4-5-6 (4-5-6-1-2)
  // 1-2-3-5-6 (5-6-1-2-3)
  // 1-2-3-4-6 (6-1-2-3-4)
  const validEscaleras = ['12345', '23456', '13456', '12456', '12356', '12346'];
  return validEscaleras.includes(str);
}

export function isFull(dice: number[]): boolean {
  if (!dice || dice.length !== 5) return false;
  const counts = Object.values(getDiceCounts(dice));
  // 3 of one + 2 of another OR 5 of a kind (serves as Full wildcard)
  return (counts.includes(3) && counts.includes(2)) || counts.includes(5);
}

export function isPoker(dice: number[]): boolean {
  if (!dice || dice.length !== 5) return false;
  const counts = Object.values(getDiceCounts(dice));
  return counts.includes(4) || counts.includes(5);
}

export function isGenerala(dice: number[]): boolean {
  if (!dice || dice.length !== 5) return false;
  const counts = Object.values(getDiceCounts(dice));
  return counts.includes(5);
}

export function calculatePotentialScore(
  category: CategoryKey,
  dice: number[],
  rollNumber: number,
  existingScores?: ScoreCard
): { points: number; isServido: boolean; isValid: boolean } {
  const isServido = rollNumber === 1;
  const counts = getDiceCounts(dice);

  switch (category) {
    case 'ones': {
      const count = counts[1] || 0;
      return { points: count * 1, isServido: false, isValid: count > 0 };
    }
    case 'twos': {
      const count = counts[2] || 0;
      return { points: count * 2, isServido: false, isValid: count > 0 };
    }
    case 'threes': {
      const count = counts[3] || 0;
      return { points: count * 3, isServido: false, isValid: count > 0 };
    }
    case 'fours': {
      const count = counts[4] || 0;
      return { points: count * 4, isServido: false, isValid: count > 0 };
    }
    case 'fives': {
      const count = counts[5] || 0;
      return { points: count * 5, isServido: false, isValid: count > 0 };
    }
    case 'sixes': {
      const count = counts[6] || 0;
      return { points: count * 6, isServido: false, isValid: count > 0 };
    }
    case 'escalera': {
      const valid = isEscalera(dice);
      return {
        points: valid ? (isServido ? 25 : 20) : 0,
        isServido: valid && isServido,
        isValid: valid,
      };
    }
    case 'full': {
      const valid = isFull(dice);
      return {
        points: valid ? (isServido ? 35 : 30) : 0,
        isServido: valid && isServido,
        isValid: valid,
      };
    }
    case 'poker': {
      const valid = isPoker(dice);
      return {
        points: valid ? (isServido ? 45 : 40) : 0,
        isServido: valid && isServido,
        isValid: valid,
      };
    }
    case 'generala': {
      const valid = isGenerala(dice);
      return {
        points: valid ? (isServido ? 60 : 50) : 0,
        isServido: valid && isServido,
        isValid: valid,
      };
    }
    case 'doble_generala': {
      const valid = isGenerala(dice);
      return {
        points: valid ? (isServido ? 120 : 100) : 0,
        isServido: valid && isServido,
        isValid: valid,
      };
    }
  }
}

export function calculateTotalScore(scores: ScoreCard): number {
  let total = 0;
  for (const key of Object.keys(scores) as CategoryKey[]) {
    const entry = scores[key];
    if (entry && !entry.isCrossedOut) {
      total += entry.points;
    }
  }
  return total;
}

export function isGameComplete(scores: ScoreCard): boolean {
  for (const cat of CATEGORIES) {
    if (scores[cat.key] === undefined) {
      return false;
    }
  }
  return true;
}
