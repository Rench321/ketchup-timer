import { useState } from 'react';
import './ConfigEditor.css';
import { TimerConfig } from '../utils/types';

interface ConfigEditorProps {
  config: TimerConfig | null; // null = create new
  onSave: (config: TimerConfig) => void;
  onCancel: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ConfigEditor({ config, onSave, onCancel }: ConfigEditorProps) {
  const isNew = config === null;
  const [name, setName] = useState(config?.name ?? '');
  const [workDuration, setWorkDuration] = useState(config?.workDuration ?? 25);
  const [breakDuration, setBreakDuration] = useState(config?.breakDuration ?? 5);
  const [longBreakDuration, setLongBreakDuration] = useState(config?.longBreakDuration ?? 15);
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(
    config?.pomodorosUntilLongBreak ?? 4
  );
  const [error, setError] = useState('');

  function handleSave() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    onSave({
      id: config?.id ?? `custom-${Date.now()}`,
      name: name.trim(),
      workDuration,
      breakDuration,
      longBreakDuration,
      pomodorosUntilLongBreak,
    });
  }

  return (
    <div className="editor-overlay">
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editor-modal__header">
          <h2 className="editor-modal__title">{isNew ? 'New Configuration' : 'Edit Configuration'}</h2>
          <button className="editor-modal__close" onClick={onCancel} id="btn-editor-close">
            <CloseIcon />
          </button>
        </div>

        <div className="editor-modal__body">
          {/* Name */}
          <div className="editor-field">
            <label className="editor-label">Name</label>
            <input
              className={`editor-input ${error ? 'editor-input--error' : ''}`}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Deep Work"
              maxLength={24}
              id="input-config-name"
            />
            {error && <span className="editor-error">{error}</span>}
          </div>

          {/* Work */}
          <NumberField
            id="input-work-duration"
            label="Work duration"
            unit="min"
            value={workDuration}
            min={1}
            max={120}
            onChange={setWorkDuration}
            accent="work"
          />

          {/* Break */}
          <NumberField
            id="input-break-duration"
            label="Short break"
            unit="min"
            value={breakDuration}
            min={1}
            max={60}
            onChange={setBreakDuration}
            accent="break"
          />

          {/* Long break */}
          <NumberField
            id="input-long-break-duration"
            label="Long break"
            unit="min"
            value={longBreakDuration}
            min={1}
            max={120}
            onChange={setLongBreakDuration}
            accent="long"
          />

          {/* Pomodoros */}
          <NumberField
            id="input-pomodoros-count"
            label="Pomodoros until long break"
            unit="×"
            unitBefore
            value={pomodorosUntilLongBreak}
            min={2}
            max={12}
            onChange={setPomodorosUntilLongBreak}
            accent="accent"
          />
        </div>

        <div className="editor-modal__footer">
          <button className="editor-btn editor-btn--cancel" onClick={onCancel} id="btn-editor-cancel">
            Cancel
          </button>
          <button className="editor-btn editor-btn--save" onClick={handleSave} id="btn-editor-save">
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── NumberField ──────────────────────────────────────────────────────────────
interface NumberFieldProps {
  id: string;
  label: string;
  unit: string;
  unitBefore?: boolean;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  accent: 'work' | 'break' | 'long' | 'accent';
}

function NumberField({ id, label, unit, unitBefore, value, min, max, onChange, accent }: NumberFieldProps) {
  function set(v: number) {
    onChange(clamp(v, min, max));
  }

  return (
    <div className="editor-field">
      <label className="editor-label">{label}</label>
      <div className="editor-number">
        <button
          className="editor-number__btn"
          onClick={() => set(value - 1)}
          disabled={value <= min}
        >−</button>
        <div className={`editor-number__display editor-number__display--${accent}`}>
          {unitBefore && <span className="editor-unit">{unit}</span>}
          <input
            id={id}
            className="editor-number__input"
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => set(parseInt(e.target.value, 10) || min)}
          />
          {!unitBefore && <span className="editor-unit">{unit}</span>}
        </div>
        <button
          className="editor-number__btn"
          onClick={() => set(value + 1)}
          disabled={value >= max}
        >+</button>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
