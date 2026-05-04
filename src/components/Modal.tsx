import type { ReactNode } from "react";

export function Modal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-panel">
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}
