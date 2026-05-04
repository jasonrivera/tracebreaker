import type { ReactNode } from "react";

export function Screen({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <main className={`screen ${compact ? "screen-compact" : ""}`}>{children}</main>;
}
