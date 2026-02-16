import { formatDayHint } from './timeBlocks';

const PRESETS = [
  { label: 'Now', minutesAgo: 0 },
  { label: '15m ago', minutesAgo: 15 },
  { label: '30m ago', minutesAgo: 30 },
  { label: '1hr ago', minutesAgo: 60 },
  { label: '2hr ago', minutesAgo: 120 },
  { label: '3hr ago', minutesAgo: 180 },
];

const DAY_ROWS: Array<{
  dayOffset: number;
  label: string;
  icon: string;
  iconColor?: string;
}> = [
  { dayOffset: 0, label: 'Today', icon: 'bi-sun', iconColor: '#eab308' },
  { dayOffset: -1, label: 'Yesterday', icon: 'bi-clock-history' },
];

interface TimePickerRootProps {
  onSelectPreset: (minutesAgo: number) => void;
  onSelectDay: (dayOffset: number) => void;
  onCustom: () => void;
}

export default function TimePickerRoot({
  onSelectPreset,
  onSelectDay,
  onCustom,
}: TimePickerRootProps) {
  return (
    <>
      <div style={{ padding: '0.75rem 0.5rem' }}>
        <div className="d-flex flex-wrap gap-1 px-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="tp-chip"
              onClick={() => onSelectPreset(p.minutesAgo)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <hr className="mx-2 my-2" style={{ opacity: 0.15 }} />

        {DAY_ROWS.map((row) => (
          <button
            key={row.dayOffset}
            type="button"
            className="d-flex align-items-center w-100 rounded-2 gap-2 text-start tp-drill-row"
            onClick={() => onSelectDay(row.dayOffset)}
            style={{
              padding: '0.5rem 0.625rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              color: 'var(--bs-body-color)',
              cursor: 'pointer',
            }}
          >
            <span
              className="text-center flex-shrink-0"
              style={{ width: '1.75rem', fontSize: '0.9rem' }}
            >
              <i className={`bi ${row.icon}`} aria-hidden="true" style={{ color: row.iconColor }} />
            </span>
            <span className="flex-grow-1">{row.label}</span>
            <span
              className="me-1"
              style={{
                fontSize: '0.75rem',
                color: 'var(--bs-secondary-color)',
              }}
            >
              {formatDayHint(row.dayOffset)}
            </span>
            <i
              className="bi bi-chevron-right"
              aria-hidden="true"
              style={{
                color: 'var(--bs-tertiary-color)',
                fontSize: '0.65rem',
              }}
            />
          </button>
        ))}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--bs-border-color-translucent)',
          padding: '0.5rem 0.5rem',
        }}
      >
        <button
          type="button"
          className="d-flex align-items-center w-100 rounded-2 gap-2 text-start tp-drill-row"
          onClick={onCustom}
          style={{
            padding: '0.5rem 0.625rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.825rem',
            color: 'var(--bs-secondary-color)',
            cursor: 'pointer',
          }}
        >
          <span
            className="text-center flex-shrink-0"
            style={{ width: '1.75rem', fontSize: '0.9rem' }}
          >
            <i className="bi bi-calendar3" aria-hidden="true" />
          </span>
          <span>Pick a specific date & time&hellip;</span>
        </button>
      </div>
    </>
  );
}
