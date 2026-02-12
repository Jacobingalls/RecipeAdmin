import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LinkListItemProps {
  to: string;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}

/**
 * List group item that renders as a `<Link>` with consistent layout.
 *
 * Simple mode (title + subtitle stacked):
 * ```tsx
 * <LinkListItem to="/products/1" title="Oats" subtitle="Quaker" />
 * ```
 *
 * With trailing content (flex layout):
 * ```tsx
 * <LinkListItem to="/admin/users/1" title={<strong>Alice</strong>} trailing={<small>2 keys</small>} />
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
