import { Pause } from "lucide-react";
import type { MutableRefObject } from "react";
import type { GameMode, PlayerProfile, RunResult, Theme } from "../game/types";
import type { TracebreakerEngine } from "../game/gameEngine";
import { GameCanvas } from "../game/GameCanvas";
import { Button } from "../components/Button";
import { formatTime } from "../utils/format";
import { todayKey } from "../utils/dailyChallenge";
import { FINAL_VAULT_LAYERS } from "../game/levelConfig";

export function GameScreen({
  mode,
  profile,
  theme,
  paused,
  hud,
  engineRef,
  onPause,
  onStats,
  onFail,
  onVictory,
}: {
  mode: GameMode;
  profile: PlayerProfile;
  theme: Theme;
  paused: boolean;
  hud: { level: number; score: number; combo: number; timeLeftMs: number };
  engineRef: MutableRefObject<TracebreakerEngine | null>;
  onPause: () => void;
  onStats: (level: number, score: number, combo: number, timeLeftMs: number) => void;
  onFail: (result: RunResult, engine: TracebreakerEngine) => void;
  onVictory: (result: RunResult) => void;
}) {
  const modeLabel = mode === "breachRun" ? "Breach Run" : mode === "finalVault" ? "Final Vault" : "Daily Breach";
  const layerLabel = mode === "finalVault" ? `Layer ${Math.min(hud.level, FINAL_VAULT_LAYERS)}/${FINAL_VAULT_LAYERS}` : `Layer ${hud.level}`;
  return (
    <main className="game-shell">
      <header className="game-hud">
        <div>
          <span>{modeLabel}</span>
          <strong>{mode === "dailyBreach" ? todayKey().slice(5) : layerLabel}</strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{hud.score}</strong>
        </div>
        <div>
          <span>Combo</span>
          <strong>x{hud.combo}</strong>
        </div>
        <div>
          <span>Timer</span>
          <strong>{formatTime(hud.timeLeftMs)}</strong>
        </div>
        <Button variant="ghost" onClick={onPause} aria-label="Pause">
          <Pause size={18} />
        </Button>
      </header>
      <GameCanvas mode={mode} profile={profile} theme={theme} paused={paused} onStats={onStats} onFail={onFail} onVictory={onVictory} engineRef={engineRef} />
      {!profile.hasSeenTutorial && <div className="tutorial-overlay">Find the matching symbol before the timer hits zero. Tap the match to break the layer.</div>}
    </main>
  );
}
