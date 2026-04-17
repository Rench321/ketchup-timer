import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TimerConfig, TimerPhase, TimerState } from '../utils/types';
import { beepWork, beepBreak, beepCycleComplete } from '../utils/sound';
import {
  loadTimerState,
  saveTimerState,
  clearTimerState,
} from './useStore';

function buildInitialState(config: TimerConfig, pomodorosCompleted: number): TimerState {
  const isLongBreak =
    (pomodorosCompleted + 1) % config.pomodorosUntilLongBreak === 0;
  return {
    configId: config.id,
    phase: 'work',
    workRemaining: config.workDuration * 60,
    breakRemaining: (isLongBreak ? config.longBreakDuration : config.breakDuration) * 60,
    pomodorosCompleted,
    isRunning: false,
    lastTickTimestamp: Date.now(),
    cycleStarted: false,
  };
}

const AUTO_RAISE_RESET_DELAY_MS = 800;

function raiseWindowToFront(): void {
  const appWindow = getCurrentWindow();

  void (async () => {
    try {
      await appWindow.unminimize();
      await appWindow.show();
      await appWindow.setAlwaysOnTop(true);
      await appWindow.setFocus();

      window.setTimeout(() => {
        void appWindow.setAlwaysOnTop(false).catch((error) => {
          console.warn('Failed to restore window z-order', error);
        });
      }, AUTO_RAISE_RESET_DELAY_MS);
    } catch (error) {
      console.warn('Failed to raise timer window', error);
      void appWindow.setAlwaysOnTop(false).catch(() => {});
    }
  })();
}

interface UseTimerReturn {
  phase: TimerPhase;
  workRemaining: number;
  breakRemaining: number;
  pomodorosCompleted: number;
  isRunning: boolean;
  totalWork: number;
  totalBreak: number;
  start: () => void;
  pause: () => void;
  switchPhase: () => void;
  reset: () => void;
}

export function useTimer(config: TimerConfig): UseTimerReturn {
  const [state, setState] = useState<TimerState>(() =>
    buildInitialState(config, 0)
  );
  const stateRef = useRef(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef(config);

  // Keep refs in sync
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { configRef.current = config; }, [config]);

  // ─── Restore state from disk on mount ───────────────────────────────────
  useEffect(() => {
    loadTimerState().then((saved) => {
      if (!saved) return;

      // If config changed since last run, start fresh
      if (saved.configId !== config.id) return;

      let restored = { ...saved };

      // Compensate for elapsed time while app was closed
      if (saved.isRunning && saved.lastTickTimestamp) {
        let elapsed = Math.floor((Date.now() - saved.lastTickTimestamp) / 1000);

        while (elapsed > 0) {
          if (restored.phase === 'work') {
            const consume = Math.min(elapsed, restored.workRemaining);
            restored.workRemaining -= consume;
            elapsed -= consume;
            if (restored.workRemaining === 0) {
              if (restored.breakRemaining === 0) {
                // Both exhausted — start a new cycle
                restored = completeCycle(restored, configRef.current);
                elapsed = 0;
              } else {
                restored.phase = 'break';
              }
            }
          } else {
            const consume = Math.min(elapsed, restored.breakRemaining);
            restored.breakRemaining -= consume;
            elapsed -= consume;
            if (restored.breakRemaining === 0) {
              if (restored.workRemaining === 0) {
                restored = completeCycle(restored, configRef.current);
                elapsed = 0;
              } else {
                restored.phase = 'work';
              }
            }
          }
        }
      }

      restored.lastTickTimestamp = Date.now();
      setState(restored);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reset when config ID changes ────────────────────────────────────────
  const prevConfigId = useRef(config.id);
  useEffect(() => {
    if (prevConfigId.current !== config.id) {
      prevConfigId.current = config.id;
      stopInterval();
      const fresh = buildInitialState(config, 0);
      setState(fresh);
      clearTimerState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id]);

  // ─── Tick interval ────────────────────────────────────────────────────────
  function startInterval() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      const prev = stateRef.current;
      const next = tick(prev, configRef.current);
      const didAutoChangePhase = prev.phase !== next.phase;

      stateRef.current = next;
      setState(next);
      saveTimerState(next);

      if (didAutoChangePhase) {
        raiseWindowToFront();
      }
    }, 1000);
  }

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // Sync interval with isRunning
  useEffect(() => {
    if (state.isRunning) {
      startInterval();
    } else {
      stopInterval();
    }
    return () => stopInterval();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRunning]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        isRunning: true,
        cycleStarted: true,
        lastTickTimestamp: Date.now(),
      };
      saveTimerState(next);
      return next;
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, isRunning: false, lastTickTimestamp: Date.now() };
      saveTimerState(next);
      return next;
    });
  }, []);

  const switchPhase = useCallback(() => {
    setState((prev) => {
      if (!prev.cycleStarted) return prev;
      const newPhase: TimerPhase = prev.phase === 'work' ? 'break' : 'work';
      const next = {
        ...prev,
        phase: newPhase,
        lastTickTimestamp: Date.now(),
      };
      if (newPhase === 'break') beepBreak();
      else beepWork();
      saveTimerState(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    stopInterval();
    const fresh = buildInitialState(configRef.current, stateRef.current.pomodorosCompleted);
    setState(fresh);
    clearTimerState();
  }, []);

  // Totals for the ring (derived from config)
  const isLongBreak =
    (state.pomodorosCompleted + 1) % config.pomodorosUntilLongBreak === 0;

  const totalWork = config.workDuration * 60;
  const totalBreak = (isLongBreak ? config.longBreakDuration : config.breakDuration) * 60;

  return {
    phase: state.phase,
    workRemaining: state.workRemaining,
    breakRemaining: state.breakRemaining,
    pomodorosCompleted: state.pomodorosCompleted,
    isRunning: state.isRunning,
    totalWork,
    totalBreak,
    start,
    pause,
    switchPhase,
    reset,
  };
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function completeCycle(state: TimerState, config: TimerConfig): TimerState {
  beepCycleComplete();
  const newCompleted = state.pomodorosCompleted + 1;
  const isLongBreak =
    (newCompleted + 1) % config.pomodorosUntilLongBreak === 0;
  return {
    ...state,
    pomodorosCompleted: newCompleted,
    phase: 'work',
    workRemaining: config.workDuration * 60,
    breakRemaining: (isLongBreak ? config.longBreakDuration : config.breakDuration) * 60,
    isRunning: true,
    cycleStarted: true,
    lastTickTimestamp: Date.now(),
  };
}

function tick(state: TimerState, config: TimerConfig): TimerState {
  if (!state.isRunning) return state;
  let next = { ...state, lastTickTimestamp: Date.now() };

  if (next.phase === 'work') {
    next.workRemaining = Math.max(0, next.workRemaining - 1);

    if (next.workRemaining === 0) {
      if (next.breakRemaining === 0) {
        // Both done — complete cycle
        return completeCycle(next, config);
      }
      // Work done, auto-switch to break
      beepBreak();
      next.phase = 'break';
    }
  } else {
    next.breakRemaining = Math.max(0, next.breakRemaining - 1);

    if (next.breakRemaining === 0) {
      if (next.workRemaining === 0) {
        // Both done — complete cycle
        return completeCycle(next, config);
      }
      // Break done, auto-switch to work
      beepWork();
      next.phase = 'work';
    }
  }

  return next;
}
