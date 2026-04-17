import { LazyStore } from '@tauri-apps/plugin-store';
import { TimerConfig, TimerState, DEFAULT_CONFIGS } from '../utils/types';

const store = new LazyStore('pomodoro.json');

export async function loadConfigs(): Promise<TimerConfig[]> {
  try {
    const configs = await store.get<TimerConfig[]>('configs');
    if (configs && configs.length > 0) return configs;
    // First run — save defaults
    await store.set('configs', DEFAULT_CONFIGS);
    await store.save();
    return DEFAULT_CONFIGS;
  } catch (e) {
    console.warn('Failed to load configs:', e);
    return DEFAULT_CONFIGS;
  }
}

export async function saveConfigs(configs: TimerConfig[]): Promise<void> {
  try {
    await store.set('configs', configs);
    await store.save();
  } catch (e) {
    console.warn('Failed to save configs:', e);
  }
}

export async function loadSelectedConfigId(): Promise<string> {
  try {
    const id = await store.get<string>('selectedConfigId');
    return id ?? DEFAULT_CONFIGS[0].id;
  } catch {
    return DEFAULT_CONFIGS[0].id;
  }
}

export async function saveSelectedConfigId(id: string): Promise<void> {
  try {
    await store.set('selectedConfigId', id);
    await store.save();
  } catch (e) {
    console.warn('Failed to save selectedConfigId:', e);
  }
}

export async function loadTimerState(): Promise<TimerState | null> {
  try {
    const state = await store.get<TimerState>('timerState');
    return state ?? null;
  } catch {
    return null;
  }
}

export async function saveTimerState(state: TimerState): Promise<void> {
  try {
    await store.set('timerState', state);
    // Note: autoSave handles persistence, explicit save only on critical writes
  } catch (e) {
    console.warn('Failed to save timerState:', e);
  }
}

export async function clearTimerState(): Promise<void> {
  try {
    await store.delete('timerState');
    await store.save();
  } catch (e) {
    console.warn('Failed to clear timerState:', e);
  }
}
