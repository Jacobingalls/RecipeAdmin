import type { ReactNode } from 'react';

interface ListRowProps {
  icon?: string;
  content: ReactNode;
  secondary?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Consistent horizontal layout for list group items.
 *
 * Renders: `[icon] [content] [spacer] [secondary] [children (actions)]`
 *
 * ```tsx
 * <ListRow icon="bi-fingerprint" content={<strong>{name}</strong>} secondary={timestamp}>
 *   <DeleteButton ariaLabel="Delete" onClick={onDelete} />
 * </ListRow>
 * ```
 */
export default function ListRow({ icon, content, secondary, className, children }: ListRowProps) {
  return (
    <div className={`list-group-item d-flex align-items-center${className ? ` ${className}` : ''}`}>
      {icon && <i className={`bi ${icon} me-3`} aria-hidden="true" />}
      <div className="me-auto">{content}</div>
      {secondary && <small className="text-body-secondary me-2 flex-shrink-0">{secondary}</small>}
      {children}
    </div>
  );
}
