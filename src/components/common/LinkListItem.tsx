import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LinkListItemProps {
  to: string;
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
export default function LinkListItem({ to, title, subtitle, trailing }: LinkListItemProps) {
  if (trailing) {
    return (
      <Link
        to={to}
        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      >
        <div>
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
    <Link to={to} className="list-group-item list-group-item-action">
      <div className="fw-bold">{title}</div>
      {subtitle && <small className="text-body-secondary">{subtitle}</small>}
    </Link>
  );
}
