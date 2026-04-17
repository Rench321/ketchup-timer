import './Controls.css';

interface ControlsProps {
  isRunning: boolean;
  cycleStarted: boolean;
  phase: 'work' | 'break' | 'idle';
  onStart: () => void;
  onPause: () => void;
  onSwitch: () => void;
  onReset: () => void;
}

export default function Controls({
  isRunning,
  cycleStarted,
  phase,
  onStart,
  onPause,
  onSwitch,
  onReset,
}: ControlsProps) {
  const isWork = phase === 'work';

  return (
    <div className="controls">
      {/* Reset */}
      <button
        className="controls__btn controls__btn--icon"
        onClick={onReset}
        title="Reset cycle"
        id="btn-reset"
      >
        <ResetIcon />
      </button>

      {/* Play / Pause */}
      <button
        className="controls__btn controls__btn--primary"
        onClick={isRunning ? onPause : onStart}
        title={isRunning ? 'Pause' : 'Start'}
        id="btn-play-pause"
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Switch phase */}
      <button
        className={`controls__btn controls__btn--switch ${!cycleStarted ? 'controls__btn--disabled' : ''}`}
        onClick={cycleStarted ? onSwitch : undefined}
        title={isWork ? 'Switch to break' : 'Switch to work'}
        id="btn-switch"
      >
        <SwitchIcon isWork={isWork} />
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function SwitchIcon({ isWork }: { isWork: boolean }) {
  return (
    <div className="switch-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
      <span className="switch-icon__label">
        {isWork ? 'Break' : 'Work'}
      </span>
    </div>
  );
}
