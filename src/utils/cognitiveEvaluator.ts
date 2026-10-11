import { CategoryKey, CognitiveProfile, DecisionRecord, ScoreCard } from '../types';
import { CATEGORIES, calculatePotentialScore, getDiceCounts } from './generalaRules';

export function calculateDecisionOptimality(
  dice: number[],
  rollNumber: number,
  heldIndices: number[],
  playerScores: ScoreCard
): { optimalHolds: number[]; optimalityScore: number } {
  const counts = getDiceCounts(dice);

  // If roll 3, all are kept
  if (rollNumber >= 3) {
    return { optimalHolds: [0, 1, 2, 3, 4], optimalityScore: 100 };
  }

  // Determine what would be mathematically optimal to hold
  let optimalIndices: number[] = [];

  // Check if we have high-count dice
  let maxCount = 0;
  let maxVal = 0;
  for (const [valStr, c] of Object.entries(counts)) {
    const val = Number(valStr);
    if (c > maxCount || (c === maxCount && val > maxVal)) {
      maxCount = c;
      maxVal = val;
    }
  }

  if (maxCount >= 2) {
    optimalIndices = dice.map((d, idx) => (d === maxVal ? idx : -1)).filter((idx) => idx !== -1);
  } else {
    // Check if 4 or 3 dice make an open straight
    const sortedVals = Array.from(new Set(dice)).sort((a, b) => a - b);
    if (sortedVals.length >= 4 && playerScores.escalera === undefined) {
      // Escalera possibility
      optimalIndices = [0, 1, 2, 3, 4];
    } else {
      // Hold highest single die
      const maxSingle = Math.max(...dice);
      const idx = dice.indexOf(maxSingle);
      optimalIndices = idx !== -1 ? [idx] : [0];
    }
  }

  // Calculate similarity between player holds and optimal holds
  const playerSet = new Set(heldIndices);
  const optimalSet = new Set(optimalIndices);

  const intersection = heldIndices.filter((x) => optimalSet.has(x)).length;
  const union = new Set([...heldIndices, ...optimalIndices]).size;

  const jaccard = union === 0 ? 1 : intersection / union;
  const optimalityScore = Math.round(jaccard * 100);

  return { optimalHolds: optimalIndices, optimalityScore };
}

export function evaluateCategoryChoice(
  dice: number[],
  rollNumber: number,
  chosenCategory: CategoryKey,
  playerScores: ScoreCard
): { optimalCategory: CategoryKey; score: number } {
  const openKeys = CATEGORIES.map((c) => c.key).filter((k) => playerScores[k] === undefined);

  if (openKeys.length === 0) return { optimalCategory: chosenCategory, score: 100 };

  const candidateScores = openKeys.map((k) => {
    const res = calculatePotentialScore(k, dice, rollNumber, playerScores);
    return { key: k, points: res.points, isValid: res.isValid };
  });

  // Best potential points
  candidateScores.sort((a, b) => b.points - a.points);
  const bestCandidate = candidateScores[0];

  const chosenCandidate = candidateScores.find((c) => c.key === chosenCategory);
  const chosenPoints = chosenCandidate?.points ?? 0;

  let score = 100;
  if (bestCandidate.points > 0) {
    if (chosenPoints === bestCandidate.points) {
      score = 100;
    } else if (chosenPoints > 0) {
      score = Math.max(60, Math.round((chosenPoints / bestCandidate.points) * 100));
    } else {
      // Chose to cross out a 0 when points were available
      score = 25;
    }
  } else {
    // Both are 0 (forced sacrifice)
    // Good sacrifice is ones, doble_generala, twos
    if (['ones', 'doble_generala', 'twos'].includes(chosenCategory)) {
      score = 100;
    } else if (['threes', 'fours'].includes(chosenCategory)) {
      score = 80;
    } else {
      score = 50; // Sacrificed high value category
    }
  }

  return { optimalCategory: bestCandidate.key, score };
}

export function computeCognitiveProfile(
  decisions: DecisionRecord[],
  playerScores: ScoreCard,
  totalGameTimeMs: number
): CognitiveProfile {
  if (decisions.length === 0) {
    return {
      speedScore: 80,
      tacticalScore: 80,
      cognitionScore: 80,
      adaptabilityScore: 80,
      riskProfile: 'Equilibrado',
      averageDecisionTimeMs: 2500,
      totalRollsUsed: 33,
      optimalDecisionsRate: 85,
      pointsPerRoll: 4.5,
      feedbackTips: ['¡Excelente inicio! Continúa practicando tu selección de dados.'],
    };
  }

  // 1. Calculate Average Decision Time & Speed Score (0-100)
  const times = decisions.map((d) => d.timeTakenMs).filter((t) => t > 0);
  const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 2500;

  // Speed scoring formula: < 2000ms = 95-100, 2000-4500ms = 80-94, 4500-8000ms = 60-79, >8000ms = 40-59
  let speedScore = 100 - (avgTime / 8000) * 50;
  speedScore = Math.max(30, Math.min(99, Math.round(speedScore)));

  // 2. Calculate Tactical / Action Score (0-100)
  const holdScores = decisions.map((d) => d.heldOptimalityScore).filter((s) => s !== undefined);
  const avgHoldScore = holdScores.length > 0 ? holdScores.reduce((a, b) => a + b, 0) / holdScores.length : 80;

  const totalPoints = Object.values(playerScores).reduce((acc, curr) => acc + (curr?.points ?? 0), 0);
  const totalRolls = decisions.length;
  const pointsPerRoll = totalRolls > 0 ? Number((totalPoints / totalRolls).toFixed(2)) : 4.0;

  // Yield efficiency multiplier
  const yieldFactor = Math.min(100, (pointsPerRoll / 6.0) * 100);
  const tacticalScore = Math.round(avgHoldScore * 0.65 + yieldFactor * 0.35);

  // 3. Calculate Cognition / Category Strategy Score (0-100)
  const catScores = decisions
    .map((d) => d.categoryOptimalityScore)
    .filter((s): s is number => s !== undefined && s > 0);
  const avgCatScore = catScores.length > 0 ? catScores.reduce((a, b) => a + b, 0) / catScores.length : 85;

  const zeroesCount = Object.values(playerScores).filter((s) => s?.points === 0).length;
  const zeroPenalty = zeroesCount * 3; // slight penalty for zeroes, but not punitive
  const cognitionScore = Math.max(35, Math.min(99, Math.round(avgCatScore - zeroPenalty)));

  // 4. Adaptability (0-100)
  // How well player recovered in 2nd and 3rd rolls
  const multiRollDecisions = decisions.filter((d) => d.rollNumber >= 2);
  const adaptAvg =
    multiRollDecisions.length > 0
      ? multiRollDecisions.reduce((acc, d) => acc + (d.heldOptimalityScore || 75), 0) / multiRollDecisions.length
      : 80;
  const adaptabilityScore = Math.max(40, Math.min(99, Math.round(adaptAvg)));

  // 5. Optimal decisions rate (%)
  const optimalCount = decisions.filter((d) => (d.heldOptimalityScore ?? 0) >= 80).length;
  const optimalDecisionsRate = Math.round((optimalCount / Math.max(1, decisions.length)) * 100);

  // 6. Risk Profile classification
  let riskProfile: 'Prudente' | 'Equilibrado' | 'Audaz' | 'Maestro Estratégico' = 'Equilibrado';
  if (cognitionScore >= 90 && tacticalScore >= 90) {
    riskProfile = 'Maestro Estratégico';
  } else if (speedScore >= 85 && tacticalScore >= 75) {
    riskProfile = 'Audaz';
  } else if (speedScore < 70 && cognitionScore >= 80) {
    riskProfile = 'Prudente';
  }

  // 7. Coaching and Cognitive Feedback Tips
  const feedbackTips: string[] = [];
  if (speedScore > 88) {
    feedbackTips.push('⚡ Reflejos ultrarrápidos: Tu tiempo de decisión promedio está en el percentil superior.');
  } else if (speedScore < 65) {
    feedbackTips.push('⏱️ Intenta confiar más en tu primer golpe de vista para mejorar la agilidad mental.');
  }

  if (tacticalScore >= 85) {
    feedbackTips.push('🎯 Excelente selección de dados retenidos: aprovechas al máximo el valor esperado.');
  } else {
    feedbackTips.push('💡 Recuerda que retener parejas te permite aspirar tanto a Full, Póker como a números altos.');
  }

  if (zeroesCount <= 1) {
    feedbackTips.push('🛡️ Gran consistencia: lograste completar la planilla casi sin casillas tachadas.');
  } else if (zeroesCount >= 3) {
    feedbackTips.push('📉 Cuando los tiros vengan difíciles, prioriza tachar los "Unos" o "Doble Generala" para proteger juegos mayores.');
  }

  if (playerScores.generala && playerScores.generala.points > 0) {
    feedbackTips.push('⭐ ¡Generala anotada! Excelente ejecución bajo presión.');
  }

  return {
    speedScore,
    tacticalScore,
    cognitionScore,
    adaptabilityScore,
    riskProfile,
    averageDecisionTimeMs: Math.round(avgTime),
    totalRollsUsed: totalRolls,
    optimalDecisionsRate,
    pointsPerRoll,
    feedbackTips,
  };
}
