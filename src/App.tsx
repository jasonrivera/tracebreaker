import { useCallback, useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { GameMode, GameStatus, PlayerProfile, RunResult } from "./game/types";
import type { TracebreakerEngine } from "./game/gameEngine";
import { HomeScreen } from "./screens/HomeScreen";
import { GameScreen } from "./screens/GameScreen";
import { PauseScreen } from "./screens/PauseScreen";
import { GameOverScreen } from "./screens/GameOverScreen";
import { VictoryScreen } from "./screens/VictoryScreen";
import { UpgradesScreen } from "./screens/UpgradesScreen";
import { ThemesScreen } from "./screens/ThemesScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { HowToPlayScreen } from "./screens/HowToPlayScreen";
import { ModeBriefingScreen } from "./screens/ModeBriefingScreen";
import { RanksScreen } from "./screens/RanksScreen";
import { CreditsScreen } from "./screens/CreditsScreen";
import { loadProfile, saveProfile } from "./storage/storage";
import { applyTheme } from "./theme/designTokens";
import { getTheme } from "./theme/themes";
import { todayKey } from "./utils/dailyChallenge";
import { startBackgroundMusic, syncBackgroundMusic, unlockAudio } from "./utils/audio";

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [status, setStatus] = useState<GameStatus>("home");
  const [mode, setMode] = useState<GameMode>("breachRun");
  const [briefingMode, setBriefingMode] = useState<Exclude<GameMode, "breachRun">>("finalVault");
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [hud, setHud] = useState({ level: 1, score: 0, combo: 0, timeLeftMs: 30000 });
  const engineRef = useRef<TracebreakerEngine | null>(null);
  const failedEngineRef = useRef<TracebreakerEngine | null>(null);
  const theme = getTheme(profile.selectedTheme);

  useEffect(() => {
    saveProfile(profile);
    applyTheme(theme);
  }, [profile, theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  useEffect(() => {
    syncBackgroundMusic(profile.settings, status === "playing" || status === "paused");
  }, [profile.settings, status]);

  useEffect(() => {
    const unlockFromGesture = () => {
      void unlockAudio(profile.settings).then(() => {
        if (status === "playing" || status === "paused") startBackgroundMusic(profile.settings);
      });
    };
    window.addEventListener("pointerdown", unlockFromGesture, { capture: true, passive: true });
    window.addEventListener("touchend", unlockFromGesture, { capture: true, passive: true });
    window.addEventListener("keydown", unlockFromGesture, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlockFromGesture, { capture: true });
      window.removeEventListener("touchend", unlockFromGesture, { capture: true });
      window.removeEventListener("keydown", unlockFromGesture, { capture: true });
    };
  }, [profile.settings, status]);

  const updateProfile = useCallback((next: PlayerProfile) => setProfile(next), []);

  const persistRun = useCallback(
    (run: RunResult) => {
      const today = todayKey();
      const comboBonus = Math.floor((profile.upgrades.comboMultiplier ?? 0) * Math.max(0, run.bestCombo / 8));
      const earned = run.creditsEarned + comboBonus;
      const dailyScores =
        run.mode === "dailyBreach"
          ? {
              ...profile.dailyChallengeScores,
              [today]: {
                date: today,
                bestLevel: Math.max(profile.dailyChallengeScores[today]?.bestLevel ?? 1, run.levelReached),
                bestScore: Math.max(profile.dailyChallengeScores[today]?.bestScore ?? 0, run.score),
              },
            }
          : profile.dailyChallengeScores;
      const nextProfile: PlayerProfile = {
        ...profile,
        bestLevel: Math.max(profile.bestLevel, run.levelReached),
        bestScore: Math.max(profile.bestScore, run.score),
        totalCredits: profile.totalCredits + earned,
        dailyChallengeScores: dailyScores,
        totalRuns: profile.totalRuns + 1,
        finalVaultCompleted: profile.finalVaultCompleted || run.finalVaultComplete,
      };
      setProfile(nextProfile);
      setResult({ ...run, creditsEarned: earned });
    },
    [profile],
  );

  const startGame = (nextMode: GameMode) => {
    void unlockAudio(profile.settings).then(() => startBackgroundMusic(profile.settings));
    setMode(nextMode);
    setPaused(false);
    setResult(null);
    setHud({ level: 1, score: 0, combo: 0, timeLeftMs: 30000 });
    setStatus("playing");
  };

  const chooseMode = (nextMode: GameMode) => {
    if (nextMode === "breachRun") {
      startGame(nextMode);
      return;
    }
    setBriefingMode(nextMode);
    setStatus("modeBriefing");
  };

  const restart = () => startGame(mode);
  const home = () => {
    setPaused(false);
    setStatus("home");
  };

  const onStats = useCallback((level: number, score: number, combo: number, timeLeftMs: number) => {
    setHud((prev) => (prev.level === level && prev.score === score && prev.combo === combo && Math.abs(prev.timeLeftMs - timeLeftMs) < 80 ? prev : { level, score, combo, timeLeftMs }));
  }, []);

  const onFail = useCallback(
    (run: RunResult, engine: TracebreakerEngine) => {
      failedEngineRef.current = engine;
      persistRun(run);
      setStatus("gameOver");
    },
    [persistRun],
  );

  const onVictory = useCallback(
    (run: RunResult) => {
      persistRun(run);
      setStatus("victory");
    },
    [persistRun],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && status === "playing") {
        setPaused(true);
        setStatus("paused");
      }
      if (event.key.toLowerCase() === "r" && status === "gameOver") restart();
      if (event.code === "Space" && status === "home") startGame("breachRun");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (status === "playing" || status === "paused") {
    return (
      <>
        <GameScreen
          mode={mode}
          profile={profile}
          theme={theme}
          paused={paused}
          hud={hud}
          engineRef={engineRef}
          onPause={() => {
            setPaused(true);
            setStatus("paused");
          }}
          onStats={(level, score, combo, timeLeftMs) => {
            if (!profile.hasSeenTutorial && combo > 0) setProfile((current) => ({ ...current, hasSeenTutorial: true }));
            onStats(level, score, combo, timeLeftMs);
          }}
          onFail={onFail}
          onVictory={onVictory}
        />
        {status === "paused" && <PauseScreen onResume={() => { setPaused(false); setStatus("playing"); }} onRestart={restart} onHome={home} />}
      </>
    );
  }

  if (status === "gameOver" && result) {
    return (
      <>
        <GameOverScreen result={result} bestLevel={Math.max(profile.bestLevel, result.levelReached)} onRestart={restart} onHome={home} />
        <Analytics />
      </>
    );
  }

  if (status === "victory" && result) {
    return (
      <>
        <VictoryScreen result={result} onRestart={restart} onHome={home} />
        <Analytics />
      </>
    );
  }
  if (status === "modeBriefing") {
    return (
      <>
        <ModeBriefingScreen mode={briefingMode} profile={profile} onStart={() => startGame(briefingMode)} onBack={home} />
        <Analytics />
      </>
    );
  }
  if (status === "upgrades") {
    return (
      <>
        <UpgradesScreen profile={profile} onUpdate={updateProfile} onBack={home} />
        <Analytics />
      </>
    );
  }
  if (status === "themes") {
    return (
      <>
        <ThemesScreen profile={profile} onUpdate={updateProfile} onBack={home} />
        <Analytics />
      </>
    );
  }
  if (status === "settings") {
    return (
      <>
        <SettingsScreen profile={profile} onUpdate={updateProfile} onBack={home} />
        <Analytics />
      </>
    );
  }
  if (status === "howToPlay") {
    return (
      <>
        <HowToPlayScreen onBack={home} />
        <Analytics />
      </>
    );
  }
  if (status === "ranks") {
    return (
      <>
        <RanksScreen profile={profile} onBack={home} />
        <Analytics />
      </>
    );
  }
  if (status === "credits") {
    return (
      <>
        <CreditsScreen profile={profile} onBack={home} />
        <Analytics />
      </>
    );
  }
  return (
    <>
      <HomeScreen profile={profile} onStart={chooseMode} onNavigate={setStatus} />
      <Analytics />
    </>
  );
}
