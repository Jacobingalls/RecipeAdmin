import type { DailyValue } from '../../config/constants';
import { NutritionUnit } from '../../domain';
import { formatSignificant } from '../../utils';

export interface SparklinePoint {
  hour: number;
  amount: number;
}

type NutrientGoal = 'target' | 'more' | 'less';

interface SparklineCardProps {
  label: string;
  unit: string;
  currentAmount: number;
  dailyValue: DailyValue | null;
  points: SparklinePoint[];
  currentHour: number;
  goal: NutrientGoal;
  size?: 'default' | 'large';
}

const GREEN = 'var(--bs-success)';
const YELLOW = 'var(--bs-warning)';
const RED = 'var(--bs-danger)';

function getColor(ratio: number, goal: NutrientGoal): string {
  switch (goal) {
    case 'target':
      if (ratio >= 0.8 && ratio <= 1.2) return GREEN;
      if (ratio >= 0.5 && ratio <= 1.5) return YELLOW;
      return RED;
    case 'more':
      if (ratio >= 0.8) return GREEN;
      if (ratio >= 0.5) return YELLOW;
      return RED;
    case 'less':
      if (ratio <= 1.0) return GREEN;
      if (ratio <= 1.2) return YELLOW;
      return RED;
  }
}

function getStatusLabel(color: string): string {
  if (color === GREEN) return 'on target';
  if (color === YELLOW) return 'near target';
  return 'off target';
}

export default function SparklineCard({
  label,
  unit,
  currentAmount,
  dailyValue,
  points,
  currentHour,
  goal,
  size = 'default',
}: SparklineCardProps) {
  let dvAmount: number | null = null;
  let ratio = 0;

  if (dailyValue) {
    const dvConverted = new NutritionUnit(dailyValue.amount, dailyValue.unit).converted(unit);
    dvAmount = dvConverted.amount;
    ratio = dvAmount > 0 ? currentAmount / dvAmount : 0;
  }

  const color = dailyValue ? getColor(ratio, goal) : GREEN;
  const percentDisplay = dailyValue
    ? `${Math.round(ratio * 1000) / 10}% of ${formatSignificant(dvAmount!)} ${unit}`
    : null;

  // SVG coordinate system: DV centered at y=0.5 when present
  const ceiling = dvAmount
    ? Math.max(dvAmount * 2, currentAmount * 1.1)
    : Math.max(currentAmount * 1.1, 1);
  const svgY = (amount: number) => 1 - amount / ceiling;

  // Build step-chart path (solid line up to currentHour)
  let stepPath = '';
  let lastY = svgY(0);
  if (points.length > 0) {
    stepPath = `M 0,${svgY(points[0].amount)}`;
    lastY = svgY(points[0].amount);
    for (let i = 1; i < points.length; i++) {
      stepPath += ` H ${points[i].hour} V ${svgY(points[i].amount)}`;
      lastY = svgY(points[i].amount);
    }
    stepPath += ` H ${currentHour}`;
  }

  const fillPath = stepPath ? `${stepPath} V 1 H 0 Z` : '';

  // Continuation path: dotted horizontal from currentHour to 24 at current level
  const continuationPath = `M ${currentHour},${lastY} H 24`;

  const textSeparationShadow = '0px 0px 2px var(--bs-card-bg), 0px 0px 8px var(--bs-card-bg)';

  return (
    <div
      className="position-relative rounded-3 overflow-hidden"
      data-testid={`sparkline-card-${label.toLowerCase()}`}
      style={{
        backgroundColor: 'var(--bs-dark-bg-subtle)',
        border: '1px solid var(--bs-card-border-color)',
      }}
    >
      <svg
        viewBox="0 0 24 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ width: '100%', height: size === 'large' ? '12rem' : '6rem', display: 'block' }}
      >
        {fillPath && (
          <path
            d={fillPath}
            fill="var(--bs-secondary-color)"
            opacity={0.05}
            vectorEffect="non-scaling-stroke"
            data-testid="fill-area"
          />
        )}
        {stepPath && (
          <path
            d={stepPath}
            fill="none"
            stroke="var(--bs-secondary-color)"
            strokeWidth="2"
            opacity={0.3}
            vectorEffect="non-scaling-stroke"
            data-testid="step-chart"
          />
        )}
        <path
          d={continuationPath}
          fill="none"
          stroke="var(--bs-secondary-color)"
          strokeWidth="2"
          strokeDasharray="2 2"
          opacity={0.25}
          vectorEffect="non-scaling-stroke"
          data-testid="continuation-line"
        />
      </svg>
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
        style={{ zIndex: 1 }}
      >
        <div
          className="small"
          style={{ opacity: 0.75, textShadow: textSeparationShadow }}
          data-testid="sparkline-label"
        >
          {label}
        </div>
        <div className="lh-1">
          {/* Here to balance out the unit so that the value is centered. */}
          <span
            className="small"
            data-testid="sparkline-unit"
            style={{ userSelect: 'none', visibility: 'hidden' }}
          >
            {unit}
          </span>
          <span
            className="fw-bold"
            style={{ fontSize: size === 'large' ? '3rem' : '2rem', color }}
            data-testid="sparkline-value"
          >
            {formatSignificant(currentAmount)}
          </span>
          {dailyValue && (
            <span className="visually-hidden" data-testid="sparkline-status">
              ({getStatusLabel(color)})
            </span>
          )}{' '}
          <span
            className="small"
            style={{ opacity: 0.5, textShadow: textSeparationShadow }}
            data-testid="sparkline-unit"
          >
            {unit}
          </span>
        </div>
        {percentDisplay && (
          <div
            className="small"
            style={{ opacity: 0.5, textShadow: textSeparationShadow }}
            data-testid="sparkline-percent"
          >
            {percentDisplay}
          </div>
        )}
      </div>
    </div>
  );
}
