import { useEffect, useRef, type MutableRefObject } from "react";
import type { GameMode, PlayerProfile, RunResult, Theme } from "./types";
import { TracebreakerEngine } from "./gameEngine";
import { pointerToCanvas } from "./input";
import { renderGame, resizeCanvas } from "./renderer";
import { playSound } from "../utils/audio";
import { vibrate } from "../utils/haptics";

interface GameCanvasProps {
  mode: GameMode;
  profile: PlayerProfile;
  theme: Theme;
  paused: boolean;
  onStats: (level: number, score: number, combo: number, timeLeftMs: number) => void;
  onFail: (result: RunResult, engine: TracebreakerEngine) => void;
  onVictory: (result: RunResult) => void;
  engineRef: MutableRefObject<TracebreakerEngine | null>;
}

export function GameCanvas({ mode, profile, theme, paused, onStats, onFail, onVictory, engineRef }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const warnedRef = useRef(false);
  const pausedRef = useRef(paused);
  const profileRef = useRef(profile);
  const themeRef = useRef(theme);
  const onStatsRef = useRef(onStats);
  const onFailRef = useRef(onFail);
  const onVictoryRef = useRef(onVictory);

  useEffect(() => {
    profileRef.current = profile;
    themeRef.current = theme;
    onStatsRef.current = onStats;
    onFailRef.current = onFail;
    onVictoryRef.current = onVictory;
  }, [profile, theme, onStats, onFail, onVictory]);

  useEffect(() => {
    pausedRef.current = paused;
    if (engineRef.current) engineRef.current.paused = paused;
  }, [engineRef, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const runProfile = profileRef.current;
    const engine = new TracebreakerEngine(mode, runProfile, {
      onCorrect: (stats, perfect) => {
        playSound(profileRef.current.settings, perfect ? "perfect" : "correct");
        vibrate(profileRef.current.settings, perfect ? [15, 20, 15] : 18);
        warnedRef.current = false;
        onStatsRef.current(stats.levelReached, stats.score, stats.currentCombo, engine.round.timeLeftMs);
      },
      onFail: (result) => {
        playSound(profileRef.current.settings, result.failedReason === "timeout" ? "timeout" : "wrong");
        window.setTimeout(() => playSound(profileRef.current.settings, "gameOver"), 90);
        vibrate(profileRef.current.settings, [80, 35, 120]);
        onFailRef.current(result, engine);
      },
      onVictory: (result) => {
        playSound(profileRef.current.settings, "victory");
        vibrate(profileRef.current.settings, [35, 40, 35, 40, 80]);
        onVictoryRef.current(result);
      },
    });
    engineRef.current = engine;
    resizeCanvas(canvas);
    engine.start();
    let raf = 0;
    const loop = (now: number) => {
      engine.paused = pausedRef.current;
      engine.update(now);
      const snapshot = renderGame(ctx, engine.round, themeRef.current, profileRef.current.settings, now);
      const low = snapshot.lowTime && engine.round.timeLeftMs < 900;
      if (low && !warnedRef.current) {
        warnedRef.current = true;
        playSound(profileRef.current.settings, "warning");
        vibrate(profileRef.current.settings, 22);
      }
      if (!low) warnedRef.current = false;
      onStatsRef.current(engine.stats.levelReached, engine.stats.score, engine.stats.currentCombo, engine.round.timeLeftMs);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const handleResize = () => resizeCanvas(canvas);
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(canvas);
    const handlePointer = (event: PointerEvent) => {
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      playSound(profileRef.current.settings, "tap");
      const point = pointerToCanvas(event, canvas);
      engine.handleTap(point.x, point.y);
    };
    canvas.addEventListener("pointerdown", handlePointer, { passive: false });
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      canvas.removeEventListener("pointerdown", handlePointer);
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [mode, engineRef]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Tracebreaker symbol grid" />;
}
