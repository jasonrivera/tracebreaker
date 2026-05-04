export function formatTime(ms: number): string {
  const seconds = Math.max(0, ms / 1000);
  return seconds >= 10 ? seconds.toFixed(1) : seconds.toFixed(2);
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${`${seconds}`.padStart(2, "0")}`;
}
