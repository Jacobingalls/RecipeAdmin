import { epochToDatetimeLocal, datetimeLocalToEpoch } from './timeBlocks';

interface TimePickerCustomProps {
  value: number;
  onChange: (epoch: number) => void;
  onBack: () => void;
}

export default function TimePickerCustom({ value, onChange, onBack }: TimePickerCustomProps) {
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
          Custom
        </span>
      </div>
      <div style={{ padding: '0.75rem' }}>
        <input
          type="datetime-local"
          className="form-control"
          value={epochToDatetimeLocal(value)}
          onChange={(e) => {
            if (e.target.value) {
              onChange(datetimeLocalToEpoch(e.target.value));
            }
          }}
          aria-label="Pick a specific date and time"
        />
      </div>
    </>
  );
}
