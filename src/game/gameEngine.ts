import type { GameMode, GameStats, GridCell, PlayerProfile, RoundState, RunResult, SymbolItem } from "./types";
import { SYMBOLS, symbolById } from "./symbols";
import { FINAL_VAULT_LAYERS, getLevelConfig } from "./levelConfig";
import { calculateCredits, createRunResult, createStats, scoreCorrect } from "./scoring";
import { createRandom, type RandomSource } from "../utils/random";
import { dailySeed } from "../utils/dailyChallenge";

export interface GameEngineEvents {
  onRoundStart?: (round: RoundState) => void;
  onCorrect?: (stats: GameStats, perfect: boolean) => void;
  onFail?: (result: RunResult) => void;
  onVictory?: (result: RunResult) => void;
  onTick?: (round: RoundState, stats: GameStats) => void;
}

export class TracebreakerEngine {
  mode: GameMode;
  profile: PlayerProfile;
  stats: GameStats;
  round: RoundState;
  rng: RandomSource;
  events: GameEngineEvents;
  paused = false;
  private failed = false;
  private failReported = false;

  constructor(mode: GameMode, profile: PlayerProfile, events: GameEngineEvents = {}, startLevel = 1) {
    this.mode = mode;
    this.profile = profile;
    this.events = events;
    this.stats = createStats();
    this.stats.levelReached = startLevel;
    this.rng = createRandom(mode === "dailyBreach" ? dailySeed() : `tracebreaker-${Date.now()}-${Math.random()}`);
    this.round = this.createRound(startLevel);
  }

  start(): void {
    this.round.startedAt = performance.now();
    this.events.onRoundStart?.(this.round);
  }

  update(now: number): void {
    this.round.flash = Math.max(0, this.round.flash - 0.025);
    this.round.shake = Math.max(0, this.round.shake - 0.035);
    if (this.paused || this.failed || this.round.solved) return;
    const elapsed = now - this.round.startedAt;
    this.round.timeLeftMs = Math.max(0, this.round.config.timeLimitMs - elapsed);
    if (this.round.timeLeftMs <= 0) {
      this.fail("timeout");
      return;
    }
    this.events.onTick?.(this.round, this.stats);
  }

  handleTap(x: number, y: number): "correct" | "wrong" | "miss" | "inactive" {
    if (this.paused || this.failed || this.round.solved) return "inactive";
    const cell = this.round.cells.find((candidate) => x >= candidate.x && x <= candidate.x + candidate.width && y >= candidate.y && y <= candidate.y + candidate.height);
    if (!cell) return "miss";
    this.stats.totalTaps += 1;
    if (!cell.isCorrect) {
      cell.tapState = "wrong";
      this.stats.wrongTaps += 1;
      this.round.feedback = "TRACE DETECTED";
      this.round.shake = 1;
      this.round.failed = true;
      this.fail("wrong");
      return "wrong";
    }
    const solveMs = performance.now() - this.round.startedAt;
    this.stats.correctTaps += 1;
    this.stats.currentCombo += 1;
    this.stats.bestCombo = Math.max(this.stats.bestCombo, this.stats.currentCombo);
    this.stats.fastestSolveMs = this.stats.fastestSolveMs === null ? solveMs : Math.min(this.stats.fastestSolveMs, solveMs);
    this.stats.totalSolveMs += solveMs;
    this.stats.lastSolveMs = solveMs;
    this.stats.score += scoreCorrect(this.stats, this.round.config.timeLimitMs, solveMs);
    cell.tapState = "correct";
    this.round.solved = true;
    this.round.feedback = this.stats.currentCombo % 5 === 0 ? `COMBO x${this.stats.currentCombo}` : solveMs <= this.round.config.timeLimitMs * 0.35 ? "GHOST STREAK" : "ACCESS GRANTED";
    this.round.flash = 1;
    const perfect = solveMs <= this.round.config.timeLimitMs * 0.35;
    this.events.onCorrect?.(this.stats, perfect);
    window.setTimeout(() => this.advance(), 260);
    return "correct";
  }

  continueFromFailure(): void {
    if (!this.failed || this.stats.continued) return;
    this.failed = false;
    this.failReported = false;
    this.stats.continued = true;
    this.stats.currentCombo = 0;
    this.round = this.createRound(this.stats.levelReached);
    this.start();
  }

  restart(profile = this.profile): void {
    this.profile = profile;
    this.stats = createStats();
    this.failed = false;
    this.failReported = false;
    this.paused = false;
    this.round = this.createRound(1);
    this.start();
  }

  private advance(): void {
    if (this.failed) return;
    const nextLevel = this.round.level + 1;
    this.stats.levelReached = nextLevel;
    if (this.mode === "finalVault" && nextLevel > FINAL_VAULT_LAYERS) {
      this.finishVictory();
      return;
    }
    this.round = this.createRound(nextLevel);
    this.start();
  }

  private fail(reason: "wrong" | "timeout"): void {
    if (this.failed) return;
    this.failed = true;
    this.failReported = true;
    this.stats.currentCombo = 0;
    this.stats.endedAt = performance.now();
    this.round.feedback = reason === "timeout" ? "TRACE COMPLETE" : this.round.feedback || "TRACE DETECTED";
    this.round.failed = true;
    this.round.shake = reason === "timeout" ? 0.65 : 1;
    this.stats.creditsEarned = calculateCredits(this.stats.levelReached, this.stats.bestCombo, this.mode, false);
    const result = createRunResult(this.mode, this.stats, reason, false);
    window.setTimeout(() => {
      if (this.failReported) this.events.onFail?.(result);
    }, 520);
  }

  private finishVictory(): void {
    this.failed = true;
    this.stats.endedAt = performance.now();
    this.stats.levelReached = FINAL_VAULT_LAYERS;
    this.stats.creditsEarned = calculateCredits(FINAL_VAULT_LAYERS, this.stats.bestCombo, this.mode, true);
    this.events.onVictory?.(createRunResult(this.mode, this.stats, "victory", true));
  }

  private createRound(level: number): RoundState {
    const config = getLevelConfig(level, this.mode, this.profile);
    const target = this.pickTarget(config.symbolPoolSize);
    const cells = this.createCells(target, config.rows * config.cols, level);
    return {
      level,
      target,
      cells,
      config,
      startedAt: performance.now(),
      timeLeftMs: config.timeLimitMs,
      solved: false,
      feedback: "",
      flash: 0,
      shake: 0,
      failed: false,
    };
  }

  private pickTarget(poolSize: number): SymbolItem {
    const focusBoost = this.profile.upgrades.focusBoost ?? 0;
    const adjustedPool = Math.max(12, poolSize - focusBoost * 2);
    const pool = SYMBOLS.slice(0, adjustedPool);
    return this.rng.pick(pool);
  }

  private createCells(target: SymbolItem, count: number, level: number): GridCell[] {
    const ids = new Set<string>([target.id]);
    const cousins = target.cousins.map((id) => symbolById.get(id)).filter((item): item is SymbolItem => !!item);
    const decoys: SymbolItem[] = [];
    const config = getLevelConfig(level, this.mode, this.profile);
    for (let i = 0; i < config.similarDecoys && cousins.length; i += 1) {
      const cousin = this.rng.pick(cousins);
      if (!ids.has(cousin.id)) {
        ids.add(cousin.id);
        decoys.push(cousin);
      }
    }
    const pool = SYMBOLS.filter((symbol) => !ids.has(symbol.id) && symbol.difficulty <= Math.max(1, Math.ceil(level / 14) + 1));
    while (decoys.length < count - 1) {
      const picked = this.rng.pick(pool);
      if (!ids.has(picked.id)) {
        ids.add(picked.id);
        decoys.push(picked);
      }
    }
    const correctIndex = this.rng.int(0, count - 1);
    return Array.from({ length: count }, (_, index) => {
      const isCorrect = index === correctIndex;
      const symbol = isCorrect ? target : decoys.pop() ?? this.rng.pick(pool);
      return {
        symbol,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        isCorrect,
        visualVariant: "normal",
        rotation: 0,
        opacity: 1,
        flickerAmount: 0,
        driftX: 0,
        driftY: 0,
        tapState: "none",
      };
    });
  }

}
