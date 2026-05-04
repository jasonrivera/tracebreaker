import type { Settings } from "../game/types";

export function vibrate(settings: Settings, pattern: number | number[]): void {
  if (!settings.hapticsEnabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Unsupported haptics should fail silently.
  }
}
