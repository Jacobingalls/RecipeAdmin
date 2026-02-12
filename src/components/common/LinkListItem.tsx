import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LinkListItemProps {
  to: string;
  icon?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}

/**
 * Navigational list group item for use inside a `<div className="list-group">`.
 *
 * Two layout modes:
 * - **Stacked** (default): bold `title` above an optional muted `subtitle`.
 * - **Split**: when `trailing` is provided, the row becomes a flex container
 *   with the title area on the left and `trailing` content on the right.
 *   Use this for metadata like counts, badges, or timestamps.
 *
 * ```tsx
 * <LinkListItem to="/products/1" title="Oats" subtitle="Quaker" />
 * <LinkListItem
 *   to="/admin/users/1"
 *   title={<strong>Alice</strong>}
 *   trailing={<small>3 passkeys, 1 API key</small>}
 * />
 * ```
 */
export default function LinkListItem({ to, icon, title, subtitle, trailing }: LinkListItemProps) {
  const iconEl = icon ? <i className={`bi ${icon} me-3`} aria-hidden="true" /> : null;

  if (trailing) {
    return (
      <Link to={to} className="list-group-item list-group-item-action d-flex align-items-center">
        {iconEl}
        <div className="me-auto">
          {title}
          {subtitle && (
            <>
              <br />
              <small className="text-body-secondary">{subtitle}</small>
            </>
          )}
        </div>
        {trailing}
      </Link>
    );
  }

  return (
    <Link to={to} className="list-group-item list-group-item-action d-flex align-items-center">
      {iconEl}
      <div>
        <div className="fw-bold">{title}</div>
        {subtitle && <small className="text-body-secondary">{subtitle}</small>}
      </div>
    </Link>
  );
}
