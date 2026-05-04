import { Coins } from "lucide-react";
import type { PlayerProfile } from "../game/types";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { StatCard } from "../components/StatCard";

export function CreditsScreen({ profile, onBack }: { profile: PlayerProfile; onBack: () => void }) {
  return (
    <Screen compact>
      <TopBar title="Credits" onBack={onBack} />
      <section className="rank-summary">
        <div className="briefing-icon">
          <Coins size={34} />
        </div>
        <span>Vault Currency</span>
        <strong>{profile.totalCredits} CR</strong>
        <p>Credits are earned after each run and spent on upgrades and cosmetic themes.</p>
      </section>
      <section className="stats-grid">
        <StatCard label="Base Earn" value="Layer / 3" />
        <StatCard label="Combo Bonus" value="Combo / 5" />
        <StatCard label="Daily Bonus" value="+3 CR" />
        <StatCard label="Vault Win" value="+80 CR" />
      </section>
      <section className="rank-list">
        <article className="rank-row active">
          <div>
            <h3>How Credits Are Earned</h3>
            <span>Run rewards</span>
          </div>
          <p>Every completed run awards credits from your final layer plus your best combo. The formula is floor(final layer / 3) + floor(best combo / 5). Combo Multiplier upgrades can add a small extra bonus.</p>
        </article>
        <article className="rank-row">
          <div>
            <h3>Breach Run</h3>
            <span>Main mode</span>
          </div>
          <p>Uses the standard credit formula. This is the most reliable way to steadily earn credits while pushing your best layer.</p>
        </article>
        <article className="rank-row">
          <div>
            <h3>Daily Breach</h3>
            <span>Daily challenge</span>
          </div>
          <p>Uses the standard formula and adds +3 credits for playing the daily date-seeded challenge.</p>
        </article>
        <article className="rank-row">
          <div>
            <h3>Final Vault</h3>
            <span>Advanced challenge</span>
          </div>
          <p>Uses the standard formula. If you clear all 100 layers, you earn an extra +80 credit completion bonus.</p>
        </article>
        <article className="rank-row">
          <div>
            <h3>How Credits Are Used</h3>
            <span>Progression</span>
          </div>
          <p>Spend credits on Upgrades for small gameplay benefits, or on Themes for cosmetic visual styles. There are no real-money purchases wired in.</p>
        </article>
      </section>
    </Screen>
  );
}
