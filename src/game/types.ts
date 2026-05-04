export type GameMode = "breachRun" | "finalVault" | "dailyBreach";

export type GameStatus =
  | "home"
  | "playing"
  | "paused"
  | "gameOver"
  | "victory"
  | "modeBriefing"
  | "ranks"
  | "credits"
  | "upgrades"
  | "themes"
  | "settings"
  | "howToPlay";

export type SymbolTone = "shape" | "arrow" | "code" | "terminal" | "alphanumeric";

export interface SymbolItem {
  id: string;
  glyph: string;
  family: SymbolTone;
  difficulty: number;
  cousins: string[];
}

export interface GridCell {
  symbol: SymbolItem;
  x: number;
  y: number;
  width: number;
  height: number;
  isCorrect: boolean;
  visualVariant: "normal" | "ghost" | "mirrored" | "hot" | "cold";
  rotation: number;
  opacity: number;
  flickerAmount: number;
  driftX: number;
  driftY: number;
  tapState: "none" | "correct" | "wrong";
}

export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  timeLimitMs: number;
  symbolPoolSize: number;
  similarDecoys: number;
  interference: number;
  movement: number;
  targetPreviewMs: number;
  canHideTarget: boolean;
  maxLevel: number | null;
}

export interface RoundState {
  level: number;
  target: SymbolItem;
  cells: GridCell[];
  config: LevelConfig;
  startedAt: number;
  timeLeftMs: number;
  solved: boolean;
  feedback: string;
  flash: number;
  shake: number;
  failed: boolean;
}

export interface GameStats {
  levelReached: number;
  score: number;
  correctTaps: number;
  wrongTaps: number;
  totalTaps: number;
  fastestSolveMs: number | null;
  totalSolveMs: number;
  bestCombo: number;
  currentCombo: number;
  creditsEarned: number;
  startedAt: number;
  endedAt: number | null;
  continued: boolean;
  lastSolveMs: number;
}

export interface Upgrade {
  id: "signalJammer" | "focusBoost" | "comboMultiplier" | "secondChanceDiscount";
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseCost: number;
}

export interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  screenEffectsEnabled: boolean;
  reducedMotion: boolean;
}

export interface DailyChallengeData {
  date: string;
  bestLevel: number;
  bestScore: number;
}

export interface PlayerProfile {
  bestLevel: number;
  bestScore: number;
  totalCredits: number;
  selectedTheme: string;
  unlockedThemes: string[];
  upgrades: Record<Upgrade["id"], number>;
  settings: Settings;
  dailyChallengeScores: Record<string, DailyChallengeData>;
  hasSeenTutorial: boolean;
  totalRuns: number;
  finalVaultCompleted: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlockedByDefault: boolean;
  colors: {
    background: string;
    panel: string;
    panelStrong: string;
    text: string;
    muted: string;
    primary: string;
    secondary: string;
    danger: string;
    warning: string;
    grid: string;
    shadow: string;
  };
}

export interface RunResult {
  mode: GameMode;
  failedReason: "wrong" | "timeout" | "quit" | "victory";
  levelReached: number;
  score: number;
  creditsEarned: number;
  accuracy: number;
  bestCombo: number;
  rank: string;
  timeSurvivedMs: number;
  finalVaultComplete: boolean;
}
