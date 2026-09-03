import { useTranslation } from 'react-i18next';

import type { MessageKey } from '../../i18n';

import { formatDayHint } from './timeBlocks';

const PRESET_MINUTES_AGO = [0, 15, 30, 60, 120, 180];

const DAY_ROWS: Array<{
  dayOffset: number;
  labelKey: MessageKey;
  icon: string;
  iconColor?: string;
}> = [
  { dayOffset: 0, labelKey: 'timePicker.today', icon: 'bi-sun', iconColor: '#eab308' },
  { dayOffset: -1, labelKey: 'timePicker.yesterday', icon: 'bi-clock-history' },
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
  const { t } = useTranslation();

  function presetLabel(minutesAgo: number): string {
    if (minutesAgo === 0) return t('timePicker.now');
    if (minutesAgo < 60) return t('timePicker.preset.minutesAgo', { amount: minutesAgo });
    return t('timePicker.preset.hoursAgo', { amount: minutesAgo / 60 });
  }

  return (
    <>
      <div style={{ padding: '0.75rem 0.5rem' }}>
        <div className="d-flex flex-wrap gap-1 px-1">
          {PRESET_MINUTES_AGO.map((minutesAgo) => (
            <button
              key={minutesAgo}
              type="button"
              className="tp-chip"
              onClick={() => onSelectPreset(minutesAgo)}
            >
              {presetLabel(minutesAgo)}
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
            <span className="flex-grow-1">{t(row.labelKey)}</span>
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
          <span>{t('timePicker.custom')}</span>
        </button>
      </div>
    </>
  );
}
