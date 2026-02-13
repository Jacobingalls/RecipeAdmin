import { Link } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';
import { ServingSize, ProductGroup } from '../../domain';
import { formatSignificant } from '../../utils/formatters';

interface GroupCardProps {
  item: ApiLookupItem;
  servingSize: ServingSize;
  onLog?: () => void;
}

export default function GroupCard({ item, servingSize, onLog }: GroupCardProps) {
  const g = item.group!;
  const group = new ProductGroup(g);

  // Calculate nutrition for this serving size
  let serving = group.serving(ServingSize.servings(1));
  try {
    serving = group.serving(servingSize);
  } catch {
    // Fall back to one serving if calculation fails
    const { oneServing } = group;
    serving = {
      nutrition: oneServing.nutrition,
      mass: oneServing.mass,
      volume: oneServing.volume,
      servings: 1,
    };
  }

  const calories = serving.nutrition?.calories?.amount;
  const mass = serving.mass?.amount;
  const massUnit = serving.mass?.unit;
  const volume = serving.volume?.amount;
  const volumeUnit = serving.volume?.unit;
  const { servings } = serving;

  return (
    <div className="card mb-2">
      <div className="d-flex align-items-center">
        <div className="card-body">
          <span className="badge bg-info mb-1">Group</span>
          <h5 className="card-title mb-1">
            <Link to={`/groups/${g.id}`}>{g.name}</Link>
          </h5>
          <div className="text-secondary small mb-1">{servingSize.toString()}</div>
          <div className="d-flex flex-wrap gap-2">
            {calories != null && (
              <span className="text-primary">{formatSignificant(calories)} cal</span>
            )}
            {mass != null && (
              <span className="text-secondary">
                {formatSignificant(mass)}
                {massUnit}
              </span>
            )}
            {volume != null && (
              <span className="text-secondary">
                {formatSignificant(volume)}
                {volumeUnit}
              </span>
            )}
            {servings !== 1 && (
              <span className="text-secondary">
                ({formatSignificant(servings)} serving{servings !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="text-secondary small mt-1">{g.items?.length ?? 0} item(s)</div>
        </div>
        {onLog && (
          <div className="pe-3">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={onLog}>
              Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
