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
  children: ReactNode;
}

/**
 * Semantic wrapper around Bootstrap button classes.
 *
 * ```tsx
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="outline-secondary" size="sm" onClick={cancel}>Cancel</Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  size,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [`btn`, `btn-${variant}`, size && `btn-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
