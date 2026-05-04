import { Award, BookOpen, Coins, Cpu, Settings, Sparkles, Zap } from "lucide-react";
import type { GameMode, GameStatus, PlayerProfile } from "../game/types";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { StatCard } from "../components/StatCard";
import { getRank } from "../game/scoring";
import { todayKey } from "../utils/dailyChallenge";

export function HomeScreen({
  profile,
  onStart,
  onNavigate,
}: {
  profile: PlayerProfile;
  onStart: (mode: GameMode) => void;
  onNavigate: (screen: GameStatus) => void;
}) {
  const today = todayKey();
  const dailyBest = profile.dailyChallengeScores[today]?.bestLevel ?? 1;
  return (
    <Screen>
      <section className="hero">
        <div className="brand-mark">TB</div>
        <h1 className="glitch" data-text="Tracebreaker">
          Tracebreaker
        </h1>
        <p>Break the trace before they find you.</p>
      </section>
      <section className="action-stack">
        <Button variant="primary" onClick={() => onStart("breachRun")} icon={<Zap size={20} />}>
          Start Breach
        </Button>
        <div className="button-grid">
          <Button onClick={() => onStart("finalVault")} icon={<Cpu size={18} />}>
            Final Vault
          </Button>
          <Button onClick={() => onStart("dailyBreach")} icon={<Sparkles size={18} />}>
            Daily Breach
          </Button>
        </div>
      </section>
      <section className="stats-grid">
        <StatCard label="Best Layer" value={profile.bestLevel} />
        <StatCard label="Credits" value={profile.totalCredits} />
        <StatCard label="Rank" value={getRank(profile.bestLevel)} />
        <StatCard label="Today's Best" value={dailyBest} />
      </section>
      <p className="home-note">Today's Best is your highest Daily Breach layer for the current date seed.</p>
      <section className="home-tools">
        <Button onClick={() => onNavigate("upgrades")}>Upgrades</Button>
        <Button onClick={() => onNavigate("themes")}>Themes</Button>
        <Button onClick={() => onNavigate("credits")} icon={<Coins size={18} />}>
          Credits
        </Button>
        <Button onClick={() => onNavigate("ranks")} icon={<Award size={18} />}>
          Ranks
        </Button>
        <Button onClick={() => onNavigate("settings")} icon={<Settings size={18} />}>
          Settings
        </Button>
        <Button onClick={() => onNavigate("howToPlay")} icon={<BookOpen size={18} />}>
          How to Play
        </Button>
      </section>
      <div className="terminal-strip">TRACE LOCK // VAULT CHANNEL // READY</div>
    </Screen>
  );
}
