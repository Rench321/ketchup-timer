export interface TimerConfig {
  id: string;
  name: string;
  workDuration: number;        // minutes
  breakDuration: number;       // minutes
  longBreakDuration: number;   // minutes
  pomodorosUntilLongBreak: number;
}

export type TimerPhase = 'idle' | 'work' | 'break';

export interface TimerState {
  configId: string;
  phase: TimerPhase;
  workRemaining: number;       // seconds
  breakRemaining: number;      // seconds
  pomodorosCompleted: number;
  isRunning: boolean;
  lastTickTimestamp: number;   // Date.now() snapshot for restoration
  cycleStarted: boolean;       // whether this cycle has been started at all
}

export const DEFAULT_CONFIGS: TimerConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
  },
  {
    id: 'short',
    name: 'Short',
    workDuration: 15,
    breakDuration: 3,
    longBreakDuration: 10,
    pomodorosUntilLongBreak: 4,
  },
  {
    id: 'long',
    name: 'Long',
    workDuration: 50,
    breakDuration: 10,
    longBreakDuration: 20,
    pomodorosUntilLongBreak: 2,
  },
];
