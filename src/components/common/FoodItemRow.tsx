import type { ReactNode } from 'react';

import { useEnergyDisplay } from '../../hooks';
import { energyUnit, formatEnergy } from '../../utils';

interface FoodItemRowProps {
  name: string;
  subtitle: ReactNode;
  /** Energy in the item's serving, in kilocalories. */
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
  const display = useEnergyDisplay();

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
        <div className="me-3 flex-grow-1" style={{ minWidth: 0 }}>
          <div className="fw-medium text-truncate">{name}</div>
          <small className="text-secondary">{subtitle}</small>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <div className="text-nowrap text-body-secondary small fw-medium">
            {calories !== null ? formatEnergy(calories, display) : `-- ${energyUnit(display)}`}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
