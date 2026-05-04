import type { PlayerProfile } from "../game/types";
import { THEMES } from "../theme/themes";
import { TopBar } from "../components/TopBar";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { playSound } from "../utils/audio";

export function ThemesScreen({ profile, onUpdate, onBack }: { profile: PlayerProfile; onUpdate: (profile: PlayerProfile) => void; onBack: () => void }) {
  const selectOrBuy = (themeId: string, cost: number) => {
    const unlocked = profile.unlockedThemes.includes(themeId);
    if (unlocked) {
      onUpdate({ ...profile, selectedTheme: themeId });
      return;
    }
    if (profile.totalCredits < cost) return;
    playSound(profile.settings, "unlock");
    onUpdate({
      ...profile,
      totalCredits: profile.totalCredits - cost,
      selectedTheme: themeId,
      unlockedThemes: [...profile.unlockedThemes, themeId],
    });
  };
  return (
    <Screen compact>
      <TopBar title="Themes" onBack={onBack} />
      <div className="credits-bar">Credits: {profile.totalCredits}</div>
      <section className="list-stack">
        {THEMES.map((theme) => {
          const unlocked = profile.unlockedThemes.includes(theme.id);
          const selected = profile.selectedTheme === theme.id;
          return (
            <article className={`theme-row ${selected ? "selected" : ""}`} key={theme.id}>
              <div className="swatch" style={{ background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.primary}, ${theme.colors.secondary})` }} />
              <div>
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
                <span>{unlocked ? "Unlocked" : `${theme.cost} credits`}</span>
              </div>
              <Button disabled={!unlocked && profile.totalCredits < theme.cost} onClick={() => selectOrBuy(theme.id, theme.cost)}>
                {selected ? "Active" : unlocked ? "Select" : "Unlock"}
              </Button>
            </article>
          );
        })}
      </section>
    </Screen>
  );
}
