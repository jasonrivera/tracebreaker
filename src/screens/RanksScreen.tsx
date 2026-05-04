import type { PlayerProfile } from "../game/types";
import { RANKS, getRank } from "../game/scoring";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";

export function RanksScreen({ profile, onBack }: { profile: PlayerProfile; onBack: () => void }) {
  const currentRank = getRank(profile.bestLevel);
  return (
    <Screen compact>
      <TopBar title="Ranks" onBack={onBack} />
      <section className="rank-summary">
        <span>Current Rank</span>
        <strong>{currentRank}</strong>
        <p>Ranks are earned by the deepest layer you have reached.</p>
      </section>
      <section className="rank-list">
        {RANKS.map((rank) => (
          <article className={`rank-row ${rank.name === currentRank ? "active" : ""}`} key={rank.name}>
            <div>
              <h3>{rank.name}</h3>
              <span>{rank.range}</span>
            </div>
            <p>{rank.meaning}</p>
          </article>
        ))}
      </section>
    </Screen>
  );
}
