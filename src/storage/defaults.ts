import type { PlayerProfile, Settings, Upgrade } from "../game/types";

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  hapticsEnabled: true,
  screenEffectsEnabled: true,
  reducedMotion: false,
};

export const UPGRADES: Upgrade[] = [
  {
    id: "signalJammer",
    name: "Signal Jammer",
    description: "Adds a tiny time buffer at the start of each layer.",
    level: 0,
    maxLevel: 5,
    baseCost: 70,
  },
  {
    id: "focusBoost",
    name: "Focus Boost",
    description: "Keeps early symbols cleaner and more distinct.",
    level: 0,
    maxLevel: 4,
    baseCost: 90,
  },
  {
    id: "comboMultiplier",
    name: "Combo Multiplier",
    description: "Adds bonus credits for long streaks.",
    level: 0,
    maxLevel: 5,
    baseCost: 110,
  },
  {
    id: "secondChanceDiscount",
    name: "Second Chance Discount",
    description: "Future hook for ad or premium continue systems.",
    level: 0,
    maxLevel: 3,
    baseCost: 130,
  },
];

export const DEFAULT_PROFILE: PlayerProfile = {
  bestLevel: 1,
  bestScore: 0,
  totalCredits: 0,
  selectedTheme: "default",
  unlockedThemes: ["default"],
  upgrades: {
    signalJammer: 0,
    focusBoost: 0,
    comboMultiplier: 0,
    secondChanceDiscount: 0,
  },
  settings: DEFAULT_SETTINGS,
  dailyChallengeScores: {},
  hasSeenTutorial: false,
  totalRuns: 0,
  finalVaultCompleted: false,
};
