import type { PlayerProfile, Settings } from "../game/types";
import { TopBar } from "../components/TopBar";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { createFreshProfile } from "../storage/storage";

const DEV_TOOLS_KEY = "tracebreaker.devTools";

export function SettingsScreen({ profile, onUpdate, onBack }: { profile: PlayerProfile; onUpdate: (profile: PlayerProfile) => void; onBack: () => void }) {
  const showDevTools = localStorage.getItem(DEV_TOOLS_KEY) === "true";
  const updateSetting = (key: keyof Settings, value: boolean) => {
    onUpdate({ ...profile, settings: { ...profile.settings, [key]: value } });
  };
  return (
    <Screen compact>
      <TopBar title="Settings" onBack={onBack} />
      <section className="list-stack">
        {([
          ["soundEnabled", "Sound"],
          ["hapticsEnabled", "Haptics"],
          ["screenEffectsEnabled", "Screen Effects"],
          ["reducedMotion", "Reduced Motion"],
        ] as Array<[keyof Settings, string]>).map(([key, label]) => (
          <label className="toggle-row" key={key}>
            <span>{label}</span>
            <input type="checkbox" checked={profile.settings[key]} onChange={(event) => updateSetting(key, event.target.checked)} />
          </label>
        ))}
      </section>
      <section className="action-stack">
        <Button onClick={() => onUpdate({ ...profile, bestLevel: 1, bestScore: 0, dailyChallengeScores: {} })}>Reset Best Score</Button>
        <Button onClick={() => onUpdate({ ...profile, totalCredits: 0 })}>Reset Credits</Button>
        {showDevTools && (
          <>
            <Button onClick={() => onUpdate({ ...profile, dailyChallengeScores: {} })}>Reset Daily Breach</Button>
            <Button onClick={() => onUpdate({ ...profile, totalCredits: profile.totalCredits + 500 })}>Add 500 Test Credits</Button>
            <Button variant="danger" onClick={() => onUpdate(createFreshProfile())}>Reset All Local Data</Button>
            <Button disabled>Remove Ads: Coming Soon</Button>
          </>
        )}
      </section>
    </Screen>
  );
}
