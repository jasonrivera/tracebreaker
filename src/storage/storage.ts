import type { PlayerProfile } from "../game/types";
import { DEFAULT_PROFILE } from "./defaults";

const KEY = "tracebreaker.profile.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_PROFILE);
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return structuredClone(DEFAULT_PROFILE);
    return {
      ...structuredClone(DEFAULT_PROFILE),
      ...parsed,
      settings: { ...DEFAULT_PROFILE.settings, ...(isRecord(parsed.settings) ? parsed.settings : {}) },
      upgrades: { ...DEFAULT_PROFILE.upgrades, ...(isRecord(parsed.upgrades) ? parsed.upgrades : {}) },
      unlockedThemes: Array.isArray(parsed.unlockedThemes) ? parsed.unlockedThemes.filter((id) => typeof id === "string") : ["default"],
      dailyChallengeScores: isRecord(parsed.dailyChallengeScores) ? parsed.dailyChallengeScores : {},
    } as PlayerProfile;
  } catch {
    return structuredClone(DEFAULT_PROFILE);
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage can fail in private browsing. The game keeps running with in-memory data.
  }
}

export function resetProfileSlice(profile: PlayerProfile, slice: "best" | "credits"): PlayerProfile {
  if (slice === "best") return { ...profile, bestLevel: 1, bestScore: 0, dailyChallengeScores: {} };
  return { ...profile, totalCredits: 0 };
}
