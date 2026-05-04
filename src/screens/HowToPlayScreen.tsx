import { TopBar } from "../components/TopBar";
import { Screen } from "../components/Screen";
import { FINAL_VAULT_LAYERS } from "../game/levelConfig";

export function HowToPlayScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen compact>
      <TopBar title="How to Play" onBack={onBack} />
      <ol className="how-list">
        <li>Memorize the target symbol.</li>
        <li>Find the matching symbol in the grid.</li>
        <li>Tap it before the timer hits zero.</li>
        <li>Each level gets faster and harder.</li>
        <li>Wrong tap or expired timer ends the run.</li>
      </ol>
      <section className="how-section">
        <h3>Breach Run</h3>
        <p>The main arcade mode. Keep clearing layers until you miss or the timer expires. This is the best mode for chasing your personal best rank.</p>
      </section>
      <section className="how-section">
        <h3>Final Vault</h3>
        <p>An advanced fixed challenge with {FINAL_VAULT_LAYERS} layers. It starts harder than Breach Run, ramps the grid sooner, and ends in victory only if you clear the final layer.</p>
      </section>
      <section className="how-section">
        <h3>Daily Breach</h3>
        <p>A date-seeded challenge. Today's pattern is reused for the day, and Today's Best records your highest Daily Breach layer for that date on this device.</p>
      </section>
    </Screen>
  );
}
