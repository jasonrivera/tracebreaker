import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

export function PauseScreen({ onResume, onRestart, onHome }: { onResume: () => void; onRestart: () => void; onHome: () => void }) {
  return (
    <Modal title="TRACE PAUSED">
      <div className="modal-actions">
        <Button variant="primary" onClick={onResume}>
          Resume
        </Button>
        <Button onClick={onRestart}>Restart</Button>
        <Button variant="ghost" onClick={onHome}>
          Home
        </Button>
      </div>
    </Modal>
  );
}
