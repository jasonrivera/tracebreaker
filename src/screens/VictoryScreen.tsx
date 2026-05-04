import type { RunResult } from "../game/types";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { StatCard } from "../components/StatCard";
import { formatDuration } from "../utils/format";

export function VictoryScreen({ result, onRestart, onHome }: { result: RunResult; onRestart: () => void; onHome: () => void }) {
  return (
    <Screen compact>
      <section className="result-panel victory-panel">
        <h1>VAULT BREACHED</h1>
        <p>Tap the key. Beat the clock. Break the system.</p>
      </section>
      <section className="stats-grid">
        <StatCard label="Final Score" value={result.score} />
        <StatCard label="Time Survived" value={formatDuration(result.timeSurvivedMs)} />
        <StatCard label="Accuracy" value={`${result.accuracy}%`} />
        <StatCard label="Credits" value={`+${result.creditsEarned}`} />
      </section>
      <section className="action-stack">
        <Button variant="primary" onClick={onRestart}>
          Restart Vault
        </Button>
        <Button variant="ghost" onClick={onHome}>
          Home
        </Button>
      </section>
    </Screen>
  );
}
