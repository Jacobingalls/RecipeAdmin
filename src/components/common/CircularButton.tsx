import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type CircularButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const buttonStyle = {
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '1.1rem',
  '--bs-btn-hover-bg': 'rgba(var(--bs-body-color-rgb), 0.2)',
  '--bs-btn-hover-border-color': 'transparent',
} as CSSProperties;

/**
 * Base 2.25rem circular icon button with a subtle hover highlight.
 *
 * Touch target is below 44px but meets WCAG 2.5.8 via the spacing exception.
 *
 * Works both standalone and inside a `CircularButtonGroup`.
 *
 * ```tsx
 * <CircularButton aria-label="Delete" onClick={handleDelete}>
 *   <i className="bi bi-trash" aria-hidden="true" />
 * </CircularButton>
 * ```
 */
export default function CircularButton({ className, style, ...props }: CircularButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center p-0 text-body-secondary${className ? ` ${className}` : ''}`}
      style={{ ...buttonStyle, ...style }}
      {...props}
    />
  );
}
