import type { RoundState, Theme, Settings } from "./types";

export interface RendererSnapshot {
  width: number;
  height: number;
  lowTime: boolean;
  targetVisible: boolean;
}

export function resizeCanvas(canvas: HTMLCanvasElement): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function renderGame(ctx: CanvasRenderingContext2D, round: RoundState, theme: Theme, settings: Settings, now: number): RendererSnapshot {
  const { width, height } = ctx.canvas;
  const colors = theme.colors;
  const elapsed = now - round.startedAt;
  const progress = Math.max(0, round.timeLeftMs / round.config.timeLimitMs);
  const lowTime = round.timeLeftMs <= Math.max(1200, Math.min(3500, round.config.timeLimitMs * 0.25));
  const criticalTime = round.timeLeftMs <= 1000;
  const effects = settings.screenEffectsEnabled;
  const motion = effects && !settings.reducedMotion && round.config.movement > 0;
  const shake = effects && !settings.reducedMotion ? round.shake * 10 * Math.sin(now * 0.08) : 0;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(shake, 0);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, colors.background);
  bg.addColorStop(0.58, colors.panel);
  bg.addColorStop(1, colors.background);
  ctx.fillStyle = bg;
  ctx.fillRect(-20, 0, width + 40, height);

  if (effects) drawNoise(ctx, colors, now, round.config.interference);

  const margin = Math.max(18, width * 0.045);
  const top = Math.max(18, height * 0.03);
  const timerH = Math.max(10, height * 0.014);
  const canvasHeaderH = Math.max(76, height * 0.09);
  const targetH = Math.max(74, height * 0.13);
  const targetY = top + canvasHeaderH;
  const gridTop = targetY + targetH + Math.max(18, height * 0.035);
  const gridSize = Math.min(width - margin * 2, height - gridTop - margin);
  const cellGap = Math.max(5, Math.min(10, gridSize / 70));
  const cellW = (gridSize - cellGap * (round.config.cols - 1)) / round.config.cols;
  const cellH = (gridSize - cellGap * (round.config.rows - 1)) / round.config.rows;
  const gridX = (width - gridSize) / 2;

  ctx.font = `${Math.max(15, Math.min(42, width * 0.032))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = colors.muted;
  ctx.fillText(`LAYER ${round.level}${round.config.maxLevel ? ` / ${round.config.maxLevel}` : ""}`, margin, top + 18);
  ctx.textAlign = "right";
  ctx.fillStyle = lowTime ? colors.danger : colors.secondary;
  ctx.fillText("TIME LEFT", width - margin, top + 18);
  ctx.textAlign = "left";

  drawTimer(ctx, margin, top + Math.max(38, canvasHeaderH * 0.52), width - margin * 2, timerH, progress, colors, lowTime, criticalTime, now);

  const targetVisible = !round.config.canHideTarget || elapsed < round.config.targetPreviewMs || Math.sin(now / 90) > 0.82;
  drawTarget(ctx, margin, targetY, width - margin * 2, targetH, round, colors, targetVisible, now);
  layoutCells(round, gridX, gridTop, cellW, cellH, cellGap);
  drawGrid(ctx, round, colors, motion, now);

  if (effects) drawScanlines(ctx, colors, now, round.config.interference);
  if (lowTime && effects) drawWarning(ctx, width, height, colors, progress, criticalTime, now);
  if (round.flash > 0 && effects) {
    ctx.globalAlpha = round.flash * 0.22;
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
  if (round.feedback) drawFeedback(ctx, width, height, round.feedback, colors, now);
  ctx.restore();
  return { width, height, lowTime, targetVisible };
}

function layoutCells(round: RoundState, gridX: number, gridTop: number, cellW: number, cellH: number, gap: number): void {
  round.cells.forEach((cell, index) => {
    const row = Math.floor(index / round.config.cols);
    const col = index % round.config.cols;
    cell.x = gridX + col * (cellW + gap);
    cell.y = gridTop + row * (cellH + gap);
    cell.width = cellW;
    cell.height = cellH;
  });
}

function drawTimer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, progress: number, colors: Theme["colors"], low: boolean, critical: boolean, now: number): void {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  roundRect(ctx, x, y, w * progress, h, h / 2);
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, low ? colors.danger : colors.primary);
  grad.addColorStop(1, low ? colors.warning : colors.secondary);
  ctx.fillStyle = grad;
  ctx.shadowColor = low ? colors.danger : colors.shadow;
  ctx.shadowBlur = critical ? 28 + Math.sin(now / 40) * 8 : low ? 18 + Math.sin(now / 55) * 6 : 12;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawTarget(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, round: RoundState, colors: Theme["colors"], visible: boolean, now: number): void {
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fill();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 2;
  ctx.stroke();
  const labelSize = Math.max(14, Math.min(25, w * 0.022));
  const labelY = y + Math.max(22, Math.min(28, h * 0.18));
  ctx.font = `800 ${labelSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = colors.muted;
  ctx.fillText("TARGET KEY", x + 16, labelY);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.min(88, Math.max(48, h * 0.78))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = visible ? colors.primary : colors.danger;
  ctx.shadowColor = visible ? colors.shadow : colors.danger;
  ctx.shadowBlur = 18;
  ctx.fillText(visible ? round.target.glyph : "MEM", x + w / 2, y + h / 2 + 7);
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawGrid(ctx: CanvasRenderingContext2D, round: RoundState, colors: Theme["colors"], motion: boolean, now: number): void {
  round.cells.forEach((cell) => {
    const pulse = 0.5 + Math.sin(now / 180 + cell.x * 0.01) * 0.5;
    const flicker = cell.flickerAmount ? 1 - cell.flickerAmount * (0.4 + pulse * 0.6) : 1;
    const driftX = motion ? cell.driftX * round.config.movement * Math.sin(now / 320 + cell.y) : 0;
    const driftY = motion ? cell.driftY * round.config.movement * Math.cos(now / 360 + cell.x) : 0;
    ctx.save();
    ctx.translate(cell.x + cell.width / 2 + driftX, cell.y + cell.height / 2 + driftY);
    ctx.rotate(motion ? cell.rotation * Math.sin(now / 500) : cell.rotation);
    roundRect(ctx, -cell.width / 2, -cell.height / 2, cell.width, cell.height, 7);
    const isCorrectReveal = round.solved && cell.isCorrect;
    const isWrongTap = cell.tapState === "wrong";
    ctx.fillStyle = isCorrectReveal
      ? colorMix(colors.primary, 0.12)
      : isWrongTap
        ? colorMix(colors.danger, 0.12)
        : "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = isCorrectReveal ? colors.primary : isWrongTap ? colors.danger : colors.grid;
    ctx.lineWidth = isCorrectReveal || isWrongTap ? 4 : 1.5;
    ctx.shadowColor = isCorrectReveal ? colors.primary : isWrongTap ? colors.danger : "transparent";
    ctx.shadowBlur = isCorrectReveal || isWrongTap ? 22 : 0;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = cell.opacity * flicker;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.min(cell.height * 0.62, cell.width * 0.48, 72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = isWrongTap ? colors.danger : isCorrectReveal ? colors.primary : colors.text;
    ctx.shadowColor = isWrongTap ? colors.danger : isCorrectReveal ? colors.primary : colors.shadow;
    ctx.shadowBlur = isCorrectReveal || isWrongTap ? 18 : 10;
    ctx.fillText(cell.symbol.glyph, 0, 2);
    ctx.restore();
  });
}

function colorMix(color: string, alpha: number): string {
  return color.startsWith("#") ? `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}` : `rgba(255,255,255,${alpha})`;
}

function drawFeedback(ctx: CanvasRenderingContext2D, width: number, height: number, text: string, colors: Theme["colors"], now: number): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.max(22, width * 0.064)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = text.includes("TRACE") ? colors.danger : colors.primary;
  ctx.shadowColor = text.includes("TRACE") ? colors.danger : colors.primary;
  ctx.shadowBlur = 22;
  ctx.globalAlpha = 0.8 + Math.sin(now / 45) * 0.1;
  ctx.fillText(text, width / 2, height * 0.55);
  ctx.restore();
}

function drawScanlines(ctx: CanvasRenderingContext2D, colors: Theme["colors"], now: number, intensity: number): void {
  ctx.save();
  ctx.globalAlpha = 0.08 + intensity * 0.08;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1;
  const offset = now / 18;
  for (let y = -8; y < ctx.canvas.height + 8; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y + (offset % 8));
    ctx.lineTo(ctx.canvas.width, y + (offset % 8));
    ctx.stroke();
  }
  ctx.restore();
}

function drawNoise(ctx: CanvasRenderingContext2D, colors: Theme["colors"], now: number, intensity: number): void {
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(0.18, intensity * 0.12);
  for (let i = 0; i < 8 + intensity * 18; i += 1) {
    const y = Math.abs(Math.sin(now * 0.001 + i * 9.7)) * ctx.canvas.height;
    const x = Math.abs(Math.cos(now * 0.0017 + i * 3.1)) * ctx.canvas.width;
    ctx.fillStyle = i % 2 ? colors.secondary : colors.primary;
    ctx.fillRect(x, y, 40 + intensity * 120, 1 + intensity * 3);
  }
  ctx.restore();
}

function drawWarning(ctx: CanvasRenderingContext2D, width: number, height: number, colors: Theme["colors"], progress: number, critical: boolean, now: number): void {
  ctx.save();
  ctx.globalAlpha = (1 - progress) * (critical ? 0.24 + Math.sin(now / 45) * 0.08 : 0.13 + Math.sin(now / 60) * 0.05);
  ctx.strokeStyle = colors.danger;
  ctx.lineWidth = critical ? 16 : 10;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  if (critical) {
    ctx.globalAlpha = 0.08 + Math.sin(now / 50) * 0.03;
    ctx.fillStyle = colors.danger;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}
