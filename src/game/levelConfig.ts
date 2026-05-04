import type { GameMode, LevelConfig, PlayerProfile } from "./types";

export const FINAL_VAULT_LAYERS = 100;

export function getLevelConfig(level: number, mode: GameMode, profile: PlayerProfile): LevelConfig {
  void profile;
  let rows = 2;
  const vault = mode === "finalVault";
  if (level > (vault ? 3 : 6)) rows = 3;
  if (level > (vault ? 8 : 14)) rows = 4;
  if (level > (vault ? 16 : 25)) rows = 5;
  if (level > (vault ? 28 : 38)) rows = 6;
  if (level > (vault ? 45 : 50)) rows = 7;
  if (level > (vault ? 65 : 70)) rows = 8;

  const timeLimitMs = vault ? Math.max(3000, 18000 - (level - 1) * 1500) : Math.max(3000, 30000 - (level - 1) * 3000);
  const interference = Math.min(1, Math.max(0, (level - (vault ? 4 : 8)) / (vault ? 42 : 50)));
  const movement = 0;
  const canHideTarget = false;
  const targetPreviewMs = timeLimitMs;

  return {
    level,
    rows,
    cols: rows,
    timeLimitMs,
    symbolPoolSize: Math.min(60, (vault ? 18 : 12) + level),
    similarDecoys: Math.min(rows * rows - 1, Math.floor(Math.max(0, level - (vault ? 5 : 10)) / (vault ? 4 : 5))),
    interference,
    movement,
    targetPreviewMs,
    canHideTarget,
    maxLevel: vault ? FINAL_VAULT_LAYERS : null,
  };
}
