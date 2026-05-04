import type { RunResult } from "../game/types";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { StatCard } from "../components/StatCard";

export function GameOverScreen({
  result,
  bestLevel,
  onRestart,
  onHome,
}: {
  result: RunResult;
  bestLevel: number;
  onRestart: () => void;
  onHome: () => void;
}) {
  return (
    <Screen compact>
      <section className="result-panel danger-panel">
        <h1>{result.failedReason === "timeout" ? "TRACE COMPLETE" : "TRACE DETECTED"}</h1>
        <p>Every second brings the trace closer.</p>
      </section>
      <section className="stats-grid">
        <StatCard label="Final Layer" value={result.levelReached} />
        <StatCard label="Best Layer" value={bestLevel} />
        <StatCard label="Score" value={result.score} />
        <StatCard label="Credits" value={`+${result.creditsEarned}`} />
        <StatCard label="Accuracy" value={`${result.accuracy}%`} />
        <StatCard label="Best Combo" value={`x${result.bestCombo}`} />
        <StatCard label="Rank" value={result.rank} />
      </section>
      <section className="action-stack">
        <Button variant="primary" onClick={onRestart}>
          Restart Breach
        </Button>
        <Button disabled>
          Jam Trace and Continue: Coming Soon
        </Button>
        <Button variant="ghost" onClick={onHome}>
          Home
        </Button>
      </section>
    </Screen>
  );
}
