import type { Settings } from "../game/types";

let context: AudioContext | null = null;
let music: {
  master: GainNode;
  filter: BiquadFilterNode;
  intervalId: number;
  step: number;
} | null = null;
let audioUnlocked = false;

function getContext(): AudioContext | null {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  context ??= new AudioContextCtor();
  return context;
}

export async function unlockAudio(settings: Settings): Promise<void> {
  if (!settings.soundEnabled || audioUnlocked) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  // iOS Safari is happiest when a tiny sound graph is started directly from
  // the user's gesture before later scheduled music/SFX events.
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1, ctx.currentTime);
  amp.gain.setValueAtTime(0.0001, ctx.currentTime);
  osc.connect(amp).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.025);
  audioUnlocked = true;
}

function tone(frequency: number, duration: number, type: OscillatorType, gain = 0.045, slideTo?: number): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
  amp.gain.setValueAtTime(0.0001, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

function playMusicNote(ctx: AudioContext, frequency: number, duration: number, gain: number, type: OscillatorType, destination: AudioNode, when = ctx.currentTime): void {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, when);
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.018);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(amp).connect(destination);
  osc.start(when);
  osc.stop(when + duration + 0.04);
}

function tickMusic(): void {
  if (!music || !context) return;
  const bass = [55, 55, 82.41, 65.41, 55, 98, 82.41, 65.41];
  const blips = [220, 0, 330, 0, 247, 0, 392, 0, 165, 0, 294, 0, 196, 0, 440, 0];
  const step = music.step;
  const now = context.currentTime;
  playMusicNote(context, bass[step % bass.length], 0.13, step % 4 === 0 ? 0.055 : 0.034, "sawtooth", music.filter, now);
  if (blips[step % blips.length]) {
    playMusicNote(context, blips[step % blips.length], 0.07, 0.018, "square", music.filter, now + 0.03);
  }
  if (step % 8 === 6) {
    playMusicNote(context, 880, 0.045, 0.012, "triangle", music.filter, now + 0.08);
  }
  music.step = (step + 1) % 32;
}

export function startBackgroundMusic(settings: Settings): void {
  if (!settings.soundEnabled || music) return;
  const ctx = getContext();
  if (!ctx) return;
  if (!audioUnlocked || ctx.state === "suspended") {
    void unlockAudio(settings).then(() => startBackgroundMusic(settings));
    return;
  }
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1350, ctx.currentTime);
  filter.Q.setValueAtTime(7, ctx.currentTime);
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.42, ctx.currentTime + 0.35);
  filter.connect(master).connect(ctx.destination);
  music = {
    master,
    filter,
    intervalId: window.setInterval(tickMusic, 180),
    step: 0,
  };
  tickMusic();
}

export function stopBackgroundMusic(): void {
  if (!music || !context) return;
  window.clearInterval(music.intervalId);
  const current = music;
  current.master.gain.cancelScheduledValues(context.currentTime);
  current.master.gain.setValueAtTime(Math.max(0.0001, current.master.gain.value), context.currentTime);
  current.master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);
  window.setTimeout(() => {
    current.master.disconnect();
    current.filter.disconnect();
  }, 320);
  music = null;
}

export function syncBackgroundMusic(settings: Settings, shouldPlay: boolean): void {
  if (settings.soundEnabled && shouldPlay) startBackgroundMusic(settings);
  else stopBackgroundMusic();
}

export type SoundEvent = "tap" | "correct" | "perfect" | "level" | "warning" | "wrong" | "timeout" | "gameOver" | "victory" | "unlock";

export function playSound(settings: Settings, event: SoundEvent): void {
  if (!settings.soundEnabled) return;
  if (event === "tap") tone(210, 0.035, "square", 0.025);
  if (event === "correct") tone(640, 0.09, "triangle", 0.045, 940);
  if (event === "perfect") {
    tone(820, 0.08, "triangle", 0.04, 1280);
    window.setTimeout(() => tone(1120, 0.07, "sine", 0.035), 55);
  }
  if (event === "level") tone(420, 0.12, "sawtooth", 0.035, 760);
  if (event === "warning") tone(180, 0.08, "square", 0.028);
  if (event === "wrong") tone(170, 0.18, "sawtooth", 0.06, 70);
  if (event === "timeout") tone(120, 0.28, "sawtooth", 0.06, 55);
  if (event === "gameOver") {
    tone(220, 0.18, "sawtooth", 0.05, 110);
    window.setTimeout(() => tone(95, 0.26, "square", 0.04), 140);
  }
  if (event === "victory") {
    [520, 660, 880, 1320].forEach((freq, index) => window.setTimeout(() => tone(freq, 0.12, "triangle", 0.045), index * 90));
  }
  if (event === "unlock") tone(980, 0.16, "sine", 0.045, 1480);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
