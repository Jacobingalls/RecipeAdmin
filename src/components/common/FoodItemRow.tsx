import type { ReactNode } from 'react';

import { formatSignificant } from '../../utils/formatters';

interface FoodItemRowProps {
  name: string;
  subtitle: ReactNode;
  calories: number | null;
  ariaLabel: string;
  onClick: () => void;
  children?: ReactNode;
}

export default function FoodItemRow({
  name,
  subtitle,
  calories,
  ariaLabel,
  onClick,
  children,
}: FoodItemRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="list-group-item list-group-item-action"
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="me-3 min-width-0">
          <div className="fw-medium text-truncate">{name}</div>
          <small className="text-secondary">{subtitle}</small>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <div className="text-nowrap text-body-secondary small fw-medium">
            {calories !== null ? `${formatSignificant(calories)} kcal` : '-- kcal'}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
