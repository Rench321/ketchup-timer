import './Timer.css';
import { TimerPhase } from '../utils/types';

interface TimerProps {
  phase: TimerPhase;
  workRemaining: number;
  breakRemaining: number;
  totalWork: number;
  totalBreak: number;
  pomodorosCompleted: number;
  pomodorosUntilLongBreak: number;
  isRunning: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer({
  phase,
  workRemaining,
  breakRemaining,
  totalWork,
  totalBreak,
  pomodorosCompleted,
  pomodorosUntilLongBreak,
  isRunning,
}: TimerProps) {
  const SIZE = 220;
  const STROKE = 9;
  const R = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  // Outer ring = current phase's remaining budget
  const remaining = phase === 'work' ? workRemaining : breakRemaining;
  const total     = phase === 'work' ? totalWork     : totalBreak;
  const progress  = total > 0 ? remaining / total : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Inner ring = other phase's remaining budget (smaller)
  const R2 = R - STROKE - 6;
  const CIRC2 = 2 * Math.PI * R2;
  const otherRemaining = phase === 'work' ? breakRemaining : workRemaining;
  const otherTotal     = phase === 'work' ? totalBreak     : totalWork;
  const otherProgress  = otherTotal > 0 ? otherRemaining / otherTotal : 0;
  const otherOffset    = CIRC2 * (1 - otherProgress);

  const isWork = phase === 'work';
  const label = isWork ? 'WORK' : 'BREAK';
  const colorClass = isWork ? 'ring--work' : 'ring--break';

  // Dots — show dots for the current long-break cycle
  const cyclePos = pomodorosCompleted % pomodorosUntilLongBreak;

  return (
    <div className={`timer ${colorClass}`}>
      <div className="timer__ring-wrapper">
        <svg
          width={SIZE}
          height={SIZE}
          className="timer__svg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {/* Track — outer */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            className="ring-track"
            fill="none"
          />
          {/* Progress — outer (current phase) */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            className={`ring-progress ${isWork ? 'ring-progress--work' : 'ring-progress--break'}`}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />

          {/* Track — inner (other phase) */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R2}
            strokeWidth={STROKE - 3}
            className="ring-track ring-track--inner"
            fill="none"
          />
          {/* Progress — inner (other phase) */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R2}
            strokeWidth={STROKE - 3}
            className={`ring-progress ring-progress--inner ${!isWork ? 'ring-progress--work' : 'ring-progress--break'}`}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC2}
            strokeDashoffset={otherOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>

        {/* Center content */}
        <div className="timer__center">
          <div className="timer__phase-label">{label}</div>
          <div className={`timer__time ${isRunning ? 'timer__time--running' : ''}`}>
            {formatTime(remaining)}
          </div>
          <div className="timer__other-time">
            <span className={`timer__other-label ${!isWork ? 'label--work' : 'label--break'}`}>
              {isWork ? 'break' : 'work'}
            </span>
            <span className="timer__other-value">
              {formatTime(otherRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Pomodoro dots */}
      <div className="timer__dots">
        {Array.from({ length: pomodorosUntilLongBreak }).map((_, i) => (
          <div
            key={i}
            className={`timer__dot ${i < cyclePos ? 'timer__dot--filled' : ''} ${i === cyclePos && phase === 'work' ? 'timer__dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
