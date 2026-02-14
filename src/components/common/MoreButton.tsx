import type { CSSProperties } from 'react';

interface MoreButtonProps {
  ariaLabel: string;
}

const buttonStyle: CSSProperties = {
  width: '2rem',
  height: '2rem',
  '--bs-btn-hover-bg': 'rgba(var(--bs-body-color-rgb), 0.1)',
  '--bs-btn-hover-border-color': 'transparent',
} as CSSProperties;

/**
 * Circular icon-only three-dots button for dropdown menus in list rows.
 *
 * Renders a Bootstrap dropdown toggle with `data-bs-toggle="dropdown"`.
 * Stops event propagation so it works inside clickable parent elements.
 *
 * ```tsx
 * <div className="dropdown">
 *   <MoreButton ariaLabel={`${name} actions`} />
 *   <ul className="dropdown-menu dropdown-menu-end">...</ul>
 * </div>
 * ```
 */
export default function MoreButton({ ariaLabel }: MoreButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center p-0 text-body-secondary"
      style={buttonStyle}
      data-bs-toggle="dropdown"
      aria-label={ariaLabel}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <i className="bi bi-three-dots" aria-hidden="true" />
    </button>
  );
}
