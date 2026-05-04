import type { PlayerProfile, Upgrade } from "../game/types";
import { TopBar } from "../components/TopBar";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { UPGRADES } from "../storage/defaults";

function cost(upgrade: Upgrade, level: number): number {
  return Math.round(upgrade.baseCost * (1 + level * 0.65));
}

export function UpgradesScreen({ profile, onUpdate, onBack }: { profile: PlayerProfile; onUpdate: (profile: PlayerProfile) => void; onBack: () => void }) {
  const buy = (upgrade: Upgrade) => {
    const current = profile.upgrades[upgrade.id] ?? 0;
    const nextCost = cost(upgrade, current);
    if (current >= upgrade.maxLevel || profile.totalCredits < nextCost) return;
    onUpdate({
      ...profile,
      totalCredits: profile.totalCredits - nextCost,
      upgrades: { ...profile.upgrades, [upgrade.id]: current + 1 },
    });
  };
  return (
    <Screen compact>
      <TopBar title="Upgrades" onBack={onBack} />
      <div className="credits-bar">Credits: {profile.totalCredits}</div>
      <section className="list-stack">
        {UPGRADES.map((upgrade) => {
          const current = profile.upgrades[upgrade.id] ?? 0;
          const nextCost = cost(upgrade, current);
          const maxed = current >= upgrade.maxLevel;
          return (
            <article className="shop-row" key={upgrade.id}>
              <div>
                <h3>{upgrade.name}</h3>
                <p>{upgrade.description}</p>
                <span>
                  Level {current} / {upgrade.maxLevel}
                </span>
              </div>
              <Button disabled={maxed || profile.totalCredits < nextCost} onClick={() => buy(upgrade)}>
                {maxed ? "Maxed" : `${nextCost} CR`}
              </Button>
            </article>
          );
        })}
      </section>
    </Screen>
  );
}
