import { Cpu, Sparkles } from "lucide-react";
import type { GameMode, PlayerProfile } from "../game/types";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { StatCard } from "../components/StatCard";
import { todayKey } from "../utils/dailyChallenge";
import { FINAL_VAULT_LAYERS } from "../game/levelConfig";

export function ModeBriefingScreen({
  mode,
  profile,
  onStart,
  onBack,
}: {
  mode: Exclude<GameMode, "breachRun">;
  profile: PlayerProfile;
  onStart: () => void;
  onBack: () => void;
}) {
  const today = todayKey();
  const dailyBest = profile.dailyChallengeScores[today]?.bestLevel ?? 1;
  const isVault = mode === "finalVault";
  return (
    <Screen compact>
      <TopBar title={isVault ? "Final Vault" : "Daily Breach"} onBack={onBack} />
      <section className={`result-panel ${isVault ? "victory-panel" : ""}`}>
        <div className="briefing-icon">{isVault ? <Cpu size={34} /> : <Sparkles size={34} />}</div>
        <h1>{isVault ? "100-Layer Vault" : "Daily Seed"}</h1>
        <p>{isVault ? "A harder 100-layer challenge built for experienced players." : "One date-seeded run. Today's pattern is the same every attempt."}</p>
      </section>
      <section className="stats-grid">
        {isVault ? (
          <>
            <StatCard label="Goal" value={`${FINAL_VAULT_LAYERS} Layers`} />
            <StatCard label="Reward" value="+80 CR" />
            <StatCard label="Status" value={profile.finalVaultCompleted ? "Breached" : "Locked"} />
            <StatCard label="Timer" value="18s start" />
          </>
        ) : (
          <>
            <StatCard label="Date Seed" value={today.slice(5)} />
            <StatCard label="Today's Best" value={dailyBest} />
            <StatCard label="Goal" value="Best Layer" />
            <StatCard label="Timer" value="-3s/layer" />
          </>
        )}
      </section>
      <section className="briefing-copy">
        <p>{isVault ? `No endless score chase here: this mode has a finish line. Reach Layer ${FINAL_VAULT_LAYERS} and the run ends in victory. The grid and symbol pressure ramp sooner than Breach Run.` : "Daily Breach saves only today's best locally. Use it as a clean daily skill check."}</p>
      </section>
      <section className="action-stack">
        <Button variant="primary" onClick={onStart}>
          {isVault ? "Enter Vault" : "Start Daily Breach"}
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Home
        </Button>
      </section>
    </Screen>
  );
}
