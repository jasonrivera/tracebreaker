import type { GameStats, RunResult, GameMode } from "./types";

export const RANKS = [
  {
    name: "Rookie",
    range: "Layers 1-5",
    meaning: "You found the entry point. The system knows you exist.",
  },
  {
    name: "Script Kiddie",
    range: "Layers 6-10",
    meaning: "You can beat basic locks and keep your nerve under pressure.",
  },
  {
    name: "Infiltrator",
    range: "Layers 11-20",
    meaning: "You are inside the perimeter and reading patterns fast.",
  },
  {
    name: "Ghost Operator",
    range: "Layers 21-30",
    meaning: "You move cleanly through active defenses with almost no hesitation.",
  },
  {
    name: "Cipher Phantom",
    range: "Layers 31-40",
    meaning: "You can solve under serious timer pressure and dense symbol fields.",
  },
  {
    name: "Blacksite Breaker",
    range: "Layers 41-49",
    meaning: "You are one breach away from elite status.",
  },
  {
    name: "Tracebreaker",
    range: "Layer 50+",
    meaning: "You breached the deepest vault. This is the top rank.",
  },
] as const;

export function createStats(): GameStats {
  return {
    levelReached: 1,
    score: 0,
    correctTaps: 0,
    wrongTaps: 0,
    totalTaps: 0,
    fastestSolveMs: null,
    totalSolveMs: 0,
    bestCombo: 0,
    currentCombo: 0,
    creditsEarned: 0,
    startedAt: performance.now(),
    endedAt: null,
    continued: false,
    lastSolveMs: 0,
  };
}

export function scoreCorrect(stats: GameStats, timeLimitMs: number, solveMs: number): number {
  const speedRatio = Math.max(0, 1 - solveMs / timeLimitMs);
  const speedBonus = Math.round(120 * speedRatio);
  const perfectBonus = solveMs <= timeLimitMs * 0.35 ? 100 : 0;
  const comboMultiplier = 1 + Math.floor(stats.currentCombo / 5) * 0.18;
  return Math.round((100 + speedBonus + perfectBonus) * comboMultiplier);
}

export function calculateCredits(levelReached: number, bestCombo: number, mode: GameMode, victory = false): number {
  const modeBonus = mode === "finalVault" && victory ? 80 : mode === "dailyBreach" ? 3 : 0;
  return Math.floor(levelReached / 3) + Math.floor(bestCombo / 5) + modeBonus;
}

export function getAccuracy(stats: GameStats): number {
  if (!stats.totalTaps) return 100;
  return Math.round((stats.correctTaps / stats.totalTaps) * 100);
}

export function getRank(bestLevel: number): string {
  if (bestLevel >= 50) return "Tracebreaker";
  if (bestLevel >= 41) return "Blacksite Breaker";
  if (bestLevel >= 31) return "Cipher Phantom";
  if (bestLevel >= 21) return "Ghost Operator";
  if (bestLevel >= 11) return "Infiltrator";
  if (bestLevel >= 6) return "Script Kiddie";
  return "Rookie";
}

export function createRunResult(
  mode: GameMode,
  stats: GameStats,
  failedReason: RunResult["failedReason"],
  finalVaultComplete = false,
): RunResult {
  const endedAt = stats.endedAt ?? performance.now();
  return {
    mode,
    failedReason,
    levelReached: stats.levelReached,
    score: stats.score,
    creditsEarned: stats.creditsEarned,
    accuracy: getAccuracy(stats),
    bestCombo: stats.bestCombo,
    rank: getRank(stats.levelReached),
    timeSurvivedMs: Math.max(0, endedAt - stats.startedAt),
    finalVaultComplete,
  };
}
