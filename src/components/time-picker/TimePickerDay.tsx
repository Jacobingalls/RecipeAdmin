import { BLOCKS, formatBlockRange, getNowMinutes } from './timeBlocks';

interface TimePickerDayProps {
  dayOffset: number;
  onBack: () => void;
  onSelectBlock: (blockIdx: number) => void;
}

export default function TimePickerDay({ dayOffset, onBack, onSelectBlock }: TimePickerDayProps) {
  const nowMinutes = dayOffset === 0 ? getNowMinutes() : null;
  const dayLabel = dayOffset === 0 ? 'Today' : 'Yesterday';

  return (
    <>
      <div
        className="d-flex align-items-center px-3 py-2 border-bottom bg-body-tertiary position-relative"
        style={{ minHeight: '2.25rem' }}
      >
        <button
          type="button"
          className="btn btn-link btn-sm p-0 d-flex align-items-center text-decoration-none"
          onClick={onBack}
          style={{ gap: '0.125rem' }}
        >
          <i className="bi bi-chevron-left" aria-hidden="true" style={{ fontSize: '0.7rem' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>When</span>
        </button>
        <span
          className="position-absolute start-50 translate-middle-x fw-semibold"
          style={{ fontSize: '0.85rem' }}
        >
          {dayLabel}
        </span>
      </div>

      <div style={{ padding: '0.75rem 0.5rem' }}>
        {BLOCKS.map((block, idx) => {
          const isFuture = nowMinutes !== null && block.coreStart > nowMinutes;
          return (
            <button
              key={block.name}
              type="button"
              className="d-flex align-items-center w-100 rounded-2 gap-2 text-start tp-drill-row"
              disabled={isFuture}
              onClick={() => onSelectBlock(idx)}
              style={{
                padding: '0.5rem 0.625rem',
                border: 'none',
                background: 'transparent',
                fontSize: '0.875rem',
                color: 'var(--bs-body-color)',
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.35 : 1,
              }}
            >
              <span
                className="text-center flex-shrink-0"
                style={{ width: '1.75rem', fontSize: '0.9rem' }}
              >
                <i
                  className={`bi ${block.icon}`}
                  aria-hidden="true"
                  style={{ color: block.iconColor }}
                />
              </span>
              <span className="flex-grow-1">{block.name}</span>
              <span
                className="me-1"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--bs-secondary-color)',
                }}
              >
                {formatBlockRange(block)}
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
          );
        })}
      </div>
    </>
  );
}
