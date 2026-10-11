/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AIDifficulty,
  CategoryKey,
  CognitiveProfile,
  DecisionRecord,
  Die,
  GamePhase,
  GameSettings,
  MatchHistoryItem,
  ScoreCard,
} from './types';
import {
  CATEGORIES,
  calculatePotentialScore,
  calculateTotalScore,
  isGameComplete,
  isGenerala,
  isEscalera,
  isFull,
  isPoker,
} from './utils/generalaRules';
import {
  AI_PERSONALITIES,
  determineAIDecision,
  generateAICommentary,
} from './utils/aiEngine';
import {
  calculateDecisionOptimality,
  computeCognitiveProfile,
  evaluateCategoryChoice,
} from './utils/cognitiveEvaluator';
import { soundManager } from './utils/audio';
import { triggerHaptic } from './utils/haptics';

import { GameHeader } from './components/GameHeader';
import { DiceBoard } from './components/DiceBoard';
import { CognitiveRadar } from './components/CognitiveRadar';
import { AiCompanion } from './components/AiCompanion';
import { ScoreTableModal } from './components/ScoreTableModal';
import { RulesModal } from './components/RulesModal';
import { DifficultyModal } from './components/DifficultyModal';
import { PostGameModal } from './components/PostGameModal';
import { StatsHistoryModal } from './components/StatsHistoryModal';
import { ClipboardList, ChevronRight } from 'lucide-react';

const INITIAL_DICE: Die[] = [
  { id: 0, value: 1, isHeld: false, rolling: false, rotation: { x: 0, y: 0, z: 0 } },
  { id: 1, value: 2, isHeld: false, rolling: false, rotation: { x: 0, y: 0, z: 0 } },
  { id: 2, value: 3, isHeld: false, rolling: false, rotation: { x: 0, y: 0, z: 0 } },
  { id: 3, value: 4, isHeld: false, rolling: false, rotation: { x: 0, y: 0, z: 0 } },
  { id: 4, value: 5, isHeld: false, rolling: false, rotation: { x: 0, y: 0, z: 0 } },
];

export default function App() {
  // Theme & Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    const savedTheme = localStorage.getItem('generala_theme') as 'dark' | 'light' | null;
    const savedSound = localStorage.getItem('generala_sound');
    return {
      theme: savedTheme || 'dark',
      soundEnabled: savedSound !== 'false',
      vibrationEnabled: true,
      aiSpeed: 'normal',
      generalaServidaWinsInstantly: true,
    };
  });

  // Game Match State
  const [dice, setDice] = useState<Die[]>(INITIAL_DICE);
  const [rollCount, setRollCount] = useState<number>(0);
  const [turnPlayer, setTurnPlayer] = useState<'player' | 'ai'>('player');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('start');

  const [playerScores, setPlayerScores] = useState<ScoreCard>({});
  const [aiScores, setAiScores] = useState<ScoreCard>({});

  // AI State
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medio');
  const [aiThought, setAiThought] = useState<string>('Esperando tu primer tiro...');
  const [aiCommentary, setAiCommentary] = useState<string>('¡Buena suerte en la partida!');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Cognitive & Timing Evaluation State
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());

  // Match History
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('generala_match_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isScoreSheetOpen, setIsScoreSheetOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isPostGameOpen, setIsPostGameOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Sync Theme Class to HTML
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('generala_theme', settings.theme);
  }, [settings.theme]);

  // Sync Sound
  useEffect(() => {
    soundManager.setMuted(!settings.soundEnabled);
    localStorage.setItem('generala_sound', String(settings.soundEnabled));
  }, [settings.soundEnabled]);

  // Live Cognitive Profile
  const cognitiveProfile: CognitiveProfile = computeCognitiveProfile(
    decisions,
    playerScores,
    Date.now() - gameStartTime
  );

  const playerTotal = calculateTotalScore(playerScores);
  const aiTotal = calculateTotalScore(aiScores);

  // Restart match function
  const startNewGame = useCallback(() => {
    setDice(INITIAL_DICE.map((d) => ({ ...d, isHeld: false, rolling: false })));
    setRollCount(0);
    setTurnPlayer('player');
    setRoundNumber(1);
    setPhase('start');
    setPlayerScores({});
    setAiScores({});
    setDecisions([]);
    setGameStartTime(Date.now());
    setTurnStartTime(Date.now());
    setAiThought('Nueva partida iniciada. ¡Tira tus dados!');
    setAiCommentary('¡Que rueden los dados!');
    setIsPostGameOpen(false);
    setIsScoreSheetOpen(false);
    if (settings.soundEnabled) soundManager.playThemeSwitch();
  }, [settings.soundEnabled]);

  // Roll Dice for Player (Generates stable dice values once)
  const handlePlayerRoll = useCallback(() => {
    if (phase === 'rolling' || turnPlayer !== 'player' || rollCount >= 3) return;

    if (settings.soundEnabled) soundManager.playDiceRoll();
    if (settings.vibrationEnabled) triggerHaptic('medium');

    const nextRollCount = rollCount + 1;
    setRollCount(nextRollCount);
    setPhase('rolling');

    // Generate the exact new dice values ONCE so there are no discrepancies
    const targetValues = dice.map((d) =>
      d.isHeld ? d.value : Math.floor(Math.random() * 6) + 1
    );

    // Trigger visual rolling animation
    setDice((prev) =>
      prev.map((d, idx) =>
        d.isHeld
          ? d
          : {
              ...d,
              rolling: true,
              value: targetValues[idx],
            }
      )
    );

    // Conclude roll animation cleanly
    setTimeout(() => {
      setDice((prev) =>
        prev.map((d, idx) =>
          d.isHeld
            ? d
            : {
                ...d,
                rolling: false,
                value: targetValues[idx],
              }
        )
      );
      setPhase('scoring');

      // Audio and haptic detection for combinations
      if (isGenerala(targetValues)) {
        if (settings.soundEnabled) soundManager.playGeneralaFanfare();
        if (settings.vibrationEnabled) triggerHaptic('generala');
      } else if (isPoker(targetValues) || isFull(targetValues) || isEscalera(targetValues)) {
        if (settings.soundEnabled) soundManager.playComboChime(nextRollCount === 1);
        if (settings.vibrationEnabled) triggerHaptic('success');
      }
    }, 500);
  }, [phase, turnPlayer, rollCount, dice, settings]);

  // Toggle Held Dice manually
  const handleToggleHold = useCallback(
    (id: number) => {
      if (turnPlayer !== 'player' || rollCount === 0 || phase === 'rolling') return;

      setDice((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            const nextHeld = !d.isHeld;
            if (settings.soundEnabled) {
              if (nextHeld) soundManager.playDiceLock();
              else soundManager.playDiceUnlock();
            }
            if (settings.vibrationEnabled) triggerHaptic('light');
            return { ...d, isHeld: nextHeld };
          }
          return d;
        })
      );
    },
    [turnPlayer, rollCount, phase, settings]
  );

  // Auto-Hold suggested dice with 1 tap
  const handleAutoHoldSuggested = useCallback(
    (indices: number[]) => {
      if (turnPlayer !== 'player' || rollCount === 0 || phase === 'rolling') return;

      setDice((prev) =>
        prev.map((d, idx) => ({
          ...d,
          isHeld: indices.includes(idx),
        }))
      );
      if (settings.soundEnabled) soundManager.playDiceLock();
      if (settings.vibrationEnabled) triggerHaptic('medium');
    },
    [turnPlayer, rollCount, phase, settings]
  );

  // Player scores in a category
  const handleSelectCategory = useCallback(
    (category: CategoryKey) => {
      if (turnPlayer !== 'player' || rollCount === 0 || playerScores[category] !== undefined) return;

      const diceValues = dice.map((d) => d.value);
      const isServido = rollCount === 1;
      const potential = calculatePotentialScore(category, diceValues, rollCount, playerScores);

      // Record cognitive metrics
      const timeTakenMs = Date.now() - turnStartTime;
      const heldIndices = dice.map((d, idx) => (d.isHeld ? idx : -1)).filter((i) => i !== -1);
      const optimality = calculateDecisionOptimality(diceValues, rollCount, heldIndices, playerScores);
      const catEval = evaluateCategoryChoice(diceValues, rollCount, category, playerScores);

      const decisionRecord: DecisionRecord = {
        turn: roundNumber,
        rollNumber: rollCount,
        timeTakenMs,
        diceBefore: diceValues,
        heldDice: heldIndices,
        optimalHeldDice: optimality.optimalHolds,
        heldOptimalityScore: optimality.optimalityScore,
        selectedCategory: category,
        optimalCategory: catEval.optimalCategory,
        categoryOptimalityScore: catEval.score,
        pointsScored: potential.points,
      };

      setDecisions((prev) => [...prev, decisionRecord]);

      // Update player score
      const newPlayerScores: ScoreCard = {
        ...playerScores,
        [category]: {
          points: potential.points,
          isServido: potential.isServido,
          isCrossedOut: potential.points === 0,
        },
      };
      setPlayerScores(newPlayerScores);

      // Sound & Haptic
      if (settings.soundEnabled) {
        if ((category === 'generala' || category === 'doble_generala') && potential.points > 0) {
          soundManager.playGeneralaFanfare();
        } else if (['escalera', 'full', 'poker'].includes(category) && potential.points > 0) {
          soundManager.playComboChime(isServido);
        } else {
          soundManager.playScoreSelect();
        }
      }
      if (settings.vibrationEnabled) {
        triggerHaptic(potential.points > 0 ? 'success' : 'light');
      }

      // Check AI Commentary
      const personality = AI_PERSONALITIES[aiDifficulty];
      if (potential.points > 0 && ['generala', 'doble_generala', 'poker', 'full', 'escalera'].includes(category)) {
        setAiCommentary(
          generateAICommentary('player_combo', personality, {
            category: CATEGORIES.find((c) => c.key === category)?.name,
            points: potential.points,
          })
        );
      } else if (potential.points === 0) {
        setAiCommentary(
          generateAICommentary('zero_sacrifice', personality, {
            category: CATEGORIES.find((c) => c.key === category)?.name,
          })
        );
      }

      // Check if Instant Generala Win applies
      if (settings.generalaServidaWinsInstantly && category === 'generala' && isServido) {
        finishGame(newPlayerScores, aiScores);
        return;
      }

      // Check if game is complete for both
      if (isGameComplete(newPlayerScores) && isGameComplete(aiScores)) {
        finishGame(newPlayerScores, aiScores);
        return;
      }

      // Transition to AI Turn
      startAiTurn(newPlayerScores, aiScores);
    },
    [
      turnPlayer,
      rollCount,
      playerScores,
      aiScores,
      dice,
      turnStartTime,
      roundNumber,
      settings,
      aiDifficulty,
    ]
  );

  // Execute AI Turn Sequence
  const startAiTurn = useCallback(
    (currentPlayerScores: ScoreCard, currentAiScores: ScoreCard) => {
      setTurnPlayer('ai');
      setPhase('ai_turn');
      setIsAiThinking(true);

      const delaySpeedMs =
        settings.aiSpeed === 'instant' ? 180 : settings.aiSpeed === 'fast' ? 450 : 800;

      // Reset dice for AI
      let aiDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];

      setDice(
        aiDice.map((val, id) => ({
          id,
          value: val,
          isHeld: false,
          rolling: true,
          rotation: { x: 0, y: 0, z: 0 },
        }))
      );
      setRollCount(1);
      if (settings.soundEnabled) soundManager.playDiceRoll();

      setTimeout(() => {
        // Roll 1 result
        setDice(
          aiDice.map((val, id) => ({
            id,
            value: val,
            isHeld: false,
            rolling: false,
            rotation: { x: 0, y: 0, z: 0 },
          }))
        );

        const decision1 = determineAIDecision(
          aiDice,
          1,
          currentAiScores,
          currentPlayerScores,
          aiDifficulty
        );
        setAiThought(decision1.thoughtReason);

        if (!decision1.shouldReroll && decision1.chosenCategory) {
          // AI scores on Roll 1 (Servido!)
          applyAiScore(decision1.chosenCategory, aiDice, 1, currentAiScores, currentPlayerScores);
          return;
        }

        // Apply holds for Roll 2
        setDice((prev) =>
          prev.map((d, idx) => ({
            ...d,
            isHeld: decision1.heldDiceIndices.includes(idx),
          }))
        );

        // Perform Roll 2
        setTimeout(() => {
          if (settings.soundEnabled) soundManager.playDiceRoll();
          setRollCount(2);

          const rolledDice2 = aiDice.map((v, idx) =>
            decision1.heldDiceIndices.includes(idx) ? v : Math.floor(Math.random() * 6) + 1
          );
          aiDice = rolledDice2;

          setDice(
            aiDice.map((val, id) => ({
              id,
              value: val,
              isHeld: decision1.heldDiceIndices.includes(id),
              rolling: false,
              rotation: { x: 0, y: 0, z: 0 },
            }))
          );

          const decision2 = determineAIDecision(
            aiDice,
            2,
            currentAiScores,
            currentPlayerScores,
            aiDifficulty
          );
          setAiThought(decision2.thoughtReason);

          if (!decision2.shouldReroll && decision2.chosenCategory) {
            applyAiScore(decision2.chosenCategory, aiDice, 2, currentAiScores, currentPlayerScores);
            return;
          }

          // Apply holds for Roll 3
          setDice((prev) =>
            prev.map((d, idx) => ({
              ...d,
              isHeld: decision2.heldDiceIndices.includes(idx),
            }))
          );

          // Perform Roll 3
          setTimeout(() => {
            if (settings.soundEnabled) soundManager.playDiceRoll();
            setRollCount(3);

            const rolledDice3 = aiDice.map((v, idx) =>
              decision2.heldDiceIndices.includes(idx) ? v : Math.floor(Math.random() * 6) + 1
            );
            aiDice = rolledDice3;

            setDice(
              aiDice.map((val, id) => ({
                id,
                value: val,
                isHeld: true,
                rolling: false,
                rotation: { x: 0, y: 0, z: 0 },
              }))
            );

            // Final AI scoring
            const decision3 = determineAIDecision(
              aiDice,
              3,
              currentAiScores,
              currentPlayerScores,
              aiDifficulty
            );
            const bestCategory = decision3.chosenCategory || 'ones';
            applyAiScore(bestCategory, aiDice, 3, currentAiScores, currentPlayerScores);
          }, delaySpeedMs);
        }, delaySpeedMs);
      }, delaySpeedMs);
    },
    [aiDifficulty, settings]
  );

  // Apply AI Score to scorecard
  const applyAiScore = (
    category: CategoryKey,
    finalDice: number[],
    rollNumber: number,
    currentAiScores: ScoreCard,
    currentPlayerScores: ScoreCard
  ) => {
    const potential = calculatePotentialScore(category, finalDice, rollNumber, currentAiScores);
    const updatedAiScores: ScoreCard = {
      ...currentAiScores,
      [category]: {
        points: potential.points,
        isServido: potential.isServido,
        isCrossedOut: potential.points === 0,
      },
    };

    setAiScores(updatedAiScores);
    setIsAiThinking(false);

    const personality = AI_PERSONALITIES[aiDifficulty];
    if (potential.points > 0 && ['generala', 'doble_generala', 'poker', 'full', 'escalera'].includes(category)) {
      setAiCommentary(
        generateAICommentary('ai_combo', personality, {
          category: CATEGORIES.find((c) => c.key === category)?.name,
          points: potential.points,
        })
      );
    }

    if (settings.soundEnabled) {
      soundManager.playScoreSelect();
    }

    // Check if Game Over
    if (isGameComplete(currentPlayerScores) && isGameComplete(updatedAiScores)) {
      finishGame(currentPlayerScores, updatedAiScores);
      return;
    }

    // Pass turn back to player
    setTimeout(() => {
      setTurnPlayer('player');
      setRollCount(0);
      setPhase('start');
      setRoundNumber((r) => r + 1);
      setTurnStartTime(Date.now());
      setDice((prev) => prev.map((d) => ({ ...d, isHeld: false })));
      setAiThought(`Ronda ${roundNumber + 1}. ¡Es tu turno de tirar!`);
    }, 600);
  };

  // Finish Match and Save to History
  const finishGame = (finalPlayerScores: ScoreCard, finalAiScores: ScoreCard) => {
    setPhase('game_over');
    setIsAiThinking(false);
    setIsScoreSheetOpen(false);

    const pTotal = calculateTotalScore(finalPlayerScores);
    const aTotal = calculateTotalScore(finalAiScores);
    const won = pTotal > aTotal;

    const finalProfile = computeCognitiveProfile(
      decisions,
      finalPlayerScores,
      Date.now() - gameStartTime
    );
    const cognitiveIQ = Math.round(
      finalProfile.cognitionScore * 0.35 +
        finalProfile.tacticalScore * 0.35 +
        finalProfile.speedScore * 0.2 +
        finalProfile.adaptabilityScore * 0.1
    );

    const newHistoryItem: MatchHistoryItem = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      playerScore: pTotal,
      aiScore: aTotal,
      won,
      difficulty: aiDifficulty,
      cognitiveIQ,
      speedScore: finalProfile.speedScore,
      tacticalScore: finalProfile.tacticalScore,
    };

    const updatedHistory = [newHistoryItem, ...matchHistory].slice(0, 30);
    setMatchHistory(updatedHistory);
    try {
      localStorage.setItem('generala_match_history', JSON.stringify(updatedHistory));
    } catch {
      // Safe storage
    }

    if (settings.soundEnabled) {
      if (won) soundManager.playVictory();
      else soundManager.playDefeat();
    }

    const personality = AI_PERSONALITIES[aiDifficulty];
    setAiCommentary(generateAICommentary('game_end', personality, { won }));

    setIsPostGameOpen(true);
  };

  const handleClearHistory = () => {
    setMatchHistory([]);
    try {
      localStorage.removeItem('generala_match_history');
    } catch {
      // Safe storage
    }
  };

  return (
    <div
      id="generala-app-root"
      className={`
        min-h-screen w-full transition-colors duration-200 flex flex-col items-center justify-start p-2 sm:p-4
        ${
          settings.theme === 'dark'
            ? 'bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-500 selection:text-zinc-950'
            : 'bg-stone-100 text-stone-900 antialiased selection:bg-amber-500 selection:text-zinc-950'
        }
      `}
    >
      {/* Mobile-first unified embedded container (Minimal & Compact) */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2">
        {/* Header Bar */}
        <GameHeader
          theme={settings.theme}
          soundEnabled={settings.soundEnabled}
          onToggleTheme={() =>
            setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
          }
          onToggleSound={() =>
            setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
          }
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onRestartGame={startNewGame}
          roundNumber={roundNumber}
          totalRounds={11}
        />

        {/* AI Companion Dialogue Strip */}
        <AiCompanion
          personality={AI_PERSONALITIES[aiDifficulty]}
          thought={aiThought}
          commentary={aiCommentary}
          isAiThinking={isAiThinking}
          theme={settings.theme}
          onOpenDifficultyModal={() => setIsDifficultyOpen(true)}
        />

        {/* Planilla Toggle Button (Hidden by default, opens on button press) */}
        <button
          type="button"
          onClick={() => setIsScoreSheetOpen(true)}
          className={`
            w-full py-2 px-3 rounded-2xl border flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer transition-all shadow-xs
            ${
              settings.theme === 'dark'
                ? 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-amber-500" />
            <span>Planilla</span>
            <span className="text-zinc-400 font-normal">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Tú: {playerTotal} pts
            </span>
            <span className="text-zinc-400">vs</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              IA: {aiTotal} pts
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
            <span>Ver Casillas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Dice Arena & 1-Tap Auto-Assistant */}
        <DiceBoard
          dice={dice}
          rollCount={rollCount}
          phase={phase}
          onRoll={handlePlayerRoll}
          onToggleHold={handleToggleHold}
          onAutoHoldSuggested={handleAutoHoldSuggested}
          onQuickScoreBest={handleSelectCategory}
          theme={settings.theme}
          turnPlayer={turnPlayer}
          playerScores={playerScores}
          aiScores={aiScores}
        />

        {/* Mini Live Cognitive Stats */}
        <CognitiveRadar
          profile={cognitiveProfile}
          theme={settings.theme}
        />
      </div>

      {/* Hidden Score Sheet Modal (Opens on Button Press) */}
      <ScoreTableModal
        isOpen={isScoreSheetOpen}
        onClose={() => setIsScoreSheetOpen(false)}
        playerScores={playerScores}
        aiScores={aiScores}
        currentDice={dice.map((d) => d.value)}
        rollCount={rollCount}
        phase={phase}
        turnPlayer={turnPlayer}
        onSelectCategory={handleSelectCategory}
        theme={settings.theme}
        aiName={AI_PERSONALITIES[aiDifficulty].name}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        theme={settings.theme}
      />

      {/* Difficulty Modal */}
      <DifficultyModal
        isOpen={isDifficultyOpen}
        onClose={() => setIsDifficultyOpen(false)}
        currentDifficulty={aiDifficulty}
        onSelectDifficulty={(diff) => setAiDifficulty(diff)}
        aiSpeed={settings.aiSpeed}
        onSelectSpeed={(spd) => setSettings((s) => ({ ...s, aiSpeed: spd }))}
        theme={settings.theme}
      />

      {/* Post Game Cognitive Assessment Modal */}
      <PostGameModal
        isOpen={isPostGameOpen}
        onClose={() => setIsPostGameOpen(false)}
        onRestart={startNewGame}
        onOpenStats={() => {
          setIsPostGameOpen(false);
          setIsStatsOpen(true);
        }}
        playerScores={playerScores}
        aiScores={aiScores}
        aiName={AI_PERSONALITIES[aiDifficulty].name}
        cognitiveProfile={cognitiveProfile}
        theme={settings.theme}
      />

      {/* Match History Modal */}
      <StatsHistoryModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        history={matchHistory}
        onClearHistory={handleClearHistory}
        theme={settings.theme}
      />
    </div>
  );
}
