export type CategoryKey =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'escalera'
  | 'full'
  | 'poker'
  | 'generala'
  | 'doble_generala';

export interface CategoryInfo {
  key: CategoryKey;
  name: string;
  shortName: string;
  description: string;
  standardPoints: number | string;
  servidoPoints?: number | string;
  group: 'numeros' | 'juegos';
}

export interface ScoreEntry {
  points: number;
  isServido: boolean;
  isCrossedOut: boolean;
}

export type ScoreCard = {
  [key in CategoryKey]?: ScoreEntry;
};

export interface Die {
  id: number;
  value: number;
  isHeld: boolean;
  rolling: boolean;
  rotation: { x: number; y: number; z: number };
}

export type AIDifficulty = 'facil' | 'medio' | 'dificil';

export interface AIPersonality {
  id: AIDifficulty;
  name: string;
  title: string;
  avatar: string;
  description: string;
  style: string;
  avatarBg: string;
}

export type GamePhase = 'start' | 'rolling' | 'scoring' | 'ai_turn' | 'game_over';

export interface DecisionRecord {
  turn: number;
  rollNumber: number;
  timeTakenMs: number;
  diceBefore: number[];
  heldDice: number[];
  optimalHeldDice: number[];
  heldOptimalityScore: number; // 0 to 100
  selectedCategory?: CategoryKey;
  optimalCategory?: CategoryKey;
  categoryOptimalityScore?: number; // 0 to 100
  pointsScored?: number;
}

export interface CognitiveProfile {
  speedScore: number; // 0 - 100
  tacticalScore: number; // 0 - 100
  cognitionScore: number; // 0 - 100
  adaptabilityScore: number; // 0 - 100
  riskProfile: 'Prudente' | 'Equilibrado' | 'Audaz' | 'Maestro Estratégico';
  averageDecisionTimeMs: number;
  totalRollsUsed: number;
  optimalDecisionsRate: number; // %
  pointsPerRoll: number;
  feedbackTips: string[];
}

export interface MatchHistoryItem {
  id: string;
  date: string;
  playerScore: number;
  aiScore: number;
  won: boolean;
  difficulty: AIDifficulty;
  cognitiveIQ: number;
  speedScore: number;
  tacticalScore: number;
}

export interface GameSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  aiSpeed: 'instant' | 'fast' | 'normal';
  generalaServidaWinsInstantly: boolean;
}
