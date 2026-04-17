import { useState } from 'react';
import './ConfigSelector.css';
import { TimerConfig } from '../utils/types';

interface ConfigSelectorProps {
  configs: TimerConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (config: TimerConfig) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function ConfigSelector({
  configs,
  selectedId,
  onSelect,
  onEdit,
  onAdd,
  onDelete,
}: ConfigSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = configs.find((c) => c.id === selectedId) ?? configs[0];

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (configs.length <= 1) return;
    onDelete(id);
  }

  return (
    <div className="config-selector">
      <div className="config-selector__row">
        {/* Dropdown trigger */}
        <button
          className={`config-selector__trigger ${open ? 'config-selector__trigger--open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          id="btn-config-dropdown"
        >
          <span className="config-selector__name">{selected?.name}</span>
          <ChevronIcon />
        </button>

        {/* Edit and Add buttons */}
        <div className="config-selector__actions">
          <button
            className="config-selector__action-btn"
            onClick={() => selected && onEdit(selected)}
            title="Edit configuration"
            id="btn-config-edit"
          >
            <EditIcon />
          </button>
          <button
            className="config-selector__action-btn config-selector__action-btn--add"
            onClick={onAdd}
            title="Add configuration"
            id="btn-config-add"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Config summary */}
      {selected && (
        <div className="config-selector__summary">
          <span className="config-tag config-tag--work">{selected.workDuration}m work</span>
          <span className="config-tag__sep">·</span>
          <span className="config-tag config-tag--break">{selected.breakDuration}m break</span>
          <span className="config-tag__sep">·</span>
          <span className="config-tag config-tag--long">{selected.longBreakDuration}m long</span>
          <span className="config-tag__sep">·</span>
          <span className="config-tag config-tag--count">×{selected.pomodorosUntilLongBreak}</span>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div className="config-selector__backdrop" onClick={() => setOpen(false)} />
          <div className="config-selector__dropdown">
            {configs.map((c) => (
              <div
                key={c.id}
                className={`config-selector__item ${c.id === selectedId ? 'config-selector__item--active' : ''}`}
                onClick={() => handleSelect(c.id)}
              >
                <div className="config-selector__item-main">
                  <span className="config-selector__item-name">{c.name}</span>
                  <span className="config-selector__item-meta">
                    {c.workDuration}/{c.breakDuration}/{c.longBreakDuration} · ×{c.pomodorosUntilLongBreak}
                  </span>
                </div>
                <div className="config-selector__item-actions">
                  <button
                    className="config-selector__item-btn"
                    onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(c); }}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  {configs.length > 1 && (
                    <button
                      className="config-selector__item-btn config-selector__item-btn--delete"
                      onClick={(e) => handleDelete(e, c.id)}
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
