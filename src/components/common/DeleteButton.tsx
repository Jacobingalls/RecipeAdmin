import type { CSSProperties } from 'react';

interface DeleteButtonProps {
  ariaLabel: string;
  onClick: () => void;
}

const buttonStyle: CSSProperties = {
  width: '2rem',
  height: '2rem',
  '--bs-btn-hover-bg': 'rgba(var(--bs-body-color-rgb), 0.1)',
  '--bs-btn-hover-border-color': 'transparent',
} as CSSProperties;

/**
 * Circular icon-only trash button for destructive actions in list rows.
 *
 * ```tsx
 * <DeleteButton ariaLabel={`Delete passkey ${name}`} onClick={handleDelete} />
 * ```
 */
export default function DeleteButton({ ariaLabel, onClick }: DeleteButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center p-0 text-body-secondary flex-shrink-0"
      style={buttonStyle}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <i className="bi bi-trash" aria-hidden="true" />
    </button>
  );
}
