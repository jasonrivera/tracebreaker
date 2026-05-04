import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="topbar">
      <Button variant="ghost" onClick={onBack} aria-label="Back">
        <ArrowLeft size={18} />
      </Button>
      <h2>{title}</h2>
      <div />
    </div>
  );
}
