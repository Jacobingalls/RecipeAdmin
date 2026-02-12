import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'dark'
  | 'outline-secondary'
  | 'outline-success';

type ButtonSize = 'sm' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Bootstrap button variant. */
  variant?: ButtonVariant;
  /** Bootstrap button size modifier. */
  size?: ButtonSize;
  /** Defaults to `"button"`. Set to `"submit"` for form submission. */
  type?: 'button' | 'submit' | 'reset';
  /** Replaces content with a spinner while preserving button dimensions. */
  loading?: boolean;
  children: ReactNode;
}

/**
 * Semantic wrapper around Bootstrap button classes.
 *
 * ```tsx
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="outline-secondary" size="sm" onClick={cancel}>Cancel</Button>
 * <Button loading={isSaving}>Save</Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  size,
  type = 'button',
  loading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const classes = [`btn`, `btn-${variant}`, size && `btn-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <span
          style={{
            visibility: loading ? 'hidden' : 'visible',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {children}
        </span>
        {loading && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span className="visually-hidden">Loading</span>
          </span>
        )}
      </span>
    </button>
  );
}
