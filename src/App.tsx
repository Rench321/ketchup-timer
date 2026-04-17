import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { TimerConfig, DEFAULT_CONFIGS } from './utils/types';
import {
  loadConfigs,
  saveConfigs,
  loadSelectedConfigId,
  saveSelectedConfigId,
} from './hooks/useStore';
import { useTimer } from './hooks/useTimer';
import Timer from './components/Timer';
import Controls from './components/Controls';
import ConfigSelector from './components/ConfigSelector';
import ConfigEditor from './components/ConfigEditor';
import TitleBar from './components/TitleBar';

export default function App() {
  const [configs, setConfigs] = useState<TimerConfig[]>(DEFAULT_CONFIGS);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_CONFIGS[0].id);
  const [editorConfig, setEditorConfig] = useState<TimerConfig | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  // Load persisted configs on mount
  useEffect(() => {
    Promise.all([loadConfigs(), loadSelectedConfigId()]).then(([cfgs, id]) => {
      setConfigs(cfgs);
      const validId = cfgs.find((c) => c.id === id) ? id : cfgs[0].id;
      setSelectedId(validId);
      setLoaded(true);
    });
  }, []);

  const selectedConfig = configs.find((c) => c.id === selectedId) ?? configs[0];

  const {
    phase,
    workRemaining,
    breakRemaining,
    pomodorosCompleted,
    isRunning,
    totalWork,
    totalBreak,
    start,
    pause,
    switchPhase,
    reset,
  } = useTimer(selectedConfig);

  // Track whether cycle has been started (for Switch button enablement)
  const [cycleStarted, setCycleStarted] = useState(false);
  const handleStart = useCallback(() => {
    start();
    setCycleStarted(true);
  }, [start]);

  const handleReset = useCallback(() => {
    reset();
    setCycleStarted(false);
  }, [reset]);

  // Switch config
  async function handleSelectConfig(id: string) {
    setSelectedId(id);
    setCycleStarted(false);
    await saveSelectedConfigId(id);
  }

  // Editor
  function handleEdit(config: TimerConfig) {
    setEditorConfig(config);
  }

  function handleAdd() {
    setEditorConfig(null); // null = new
  }

  async function handleEditorSave(updated: TimerConfig) {
    let newConfigs: TimerConfig[];

    if (editorConfig === null) {
      // Creating new
      newConfigs = [...configs, updated];
      setSelectedId(updated.id);
      await saveSelectedConfigId(updated.id);
      setCycleStarted(false);
    } else {
      // Updating existing
      newConfigs = configs.map((c) => (c.id === updated.id ? updated : c));
      if (updated.id === selectedId) {
        setCycleStarted(false);
      }
    }

    setConfigs(newConfigs);
    await saveConfigs(newConfigs);
    setEditorConfig(undefined);
  }

  async function handleDelete(id: string) {
    const newConfigs = configs.filter((c) => c.id !== id);
    setConfigs(newConfigs);
    await saveConfigs(newConfigs);
    if (id === selectedId) {
      setSelectedId(newConfigs[0].id);
      await saveSelectedConfigId(newConfigs[0].id);
      setCycleStarted(false);
    }
  }

  if (!loaded) {
    return (
      <div className="app app--loading">
        <div className="loading-dot" />
      </div>
    );
  }

  return (
    <div className={`app ${phase === 'work' ? 'app--work' : 'app--break'}`}>
      <TitleBar />
      {/* Background ambient glow */}
      <div className="app__bg-glow" />

      <div className="app__content">
        {/* Config area */}
        <div className="app__section app__section--config">
          <ConfigSelector
            configs={configs}
            selectedId={selectedId}
            onSelect={handleSelectConfig}
            onEdit={handleEdit}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        </div>

        {/* Divider */}
        <div className="app__divider" />

        {/* Timer */}
        <div className="app__section app__section--timer">
          <Timer
            phase={phase}
            workRemaining={workRemaining}
            breakRemaining={breakRemaining}
            totalWork={totalWork}
            totalBreak={totalBreak}
            pomodorosCompleted={pomodorosCompleted}
            pomodorosUntilLongBreak={selectedConfig.pomodorosUntilLongBreak}
            isRunning={isRunning}
          />
        </div>

        {/* Controls */}
        <div className="app__section app__section--controls">
          <Controls
            isRunning={isRunning}
            cycleStarted={cycleStarted}
            phase={phase}
            onStart={handleStart}
            onPause={pause}
            onSwitch={switchPhase}
            onReset={handleReset}
          />
        </div>

        {/* Pomodoros completed counter */}
        <div className="app__footer">
          <span className="app__completed">
            {pomodorosCompleted} pomodoro{pomodorosCompleted !== 1 ? 's' : ''} completed
          </span>
        </div>
      </div>

      {/* Config editor modal */}
      {editorConfig !== undefined && (
        <ConfigEditor
          config={editorConfig}
          onSave={handleEditorSave}
          onCancel={() => setEditorConfig(undefined)}
        />
      )}
    </div>
  );
}
