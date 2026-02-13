import { Link } from 'react-router-dom';

import type { ApiLookupItem } from '../../api';
import type { ServingSize } from '../../domain';
import { Preparation } from '../../domain';
import { formatSignificant } from '../../utils/formatters';

interface ProductCardProps {
  item: ApiLookupItem;
  servingSize: ServingSize;
  onLog?: () => void;
}

export default function ProductCard({ item, servingSize, onLog }: ProductCardProps) {
  const p = item.product!;
  const prepData =
    p.preparations?.find((pr) => pr.id === item.preparationID) || p.preparations?.[0];
  const prep = prepData ? new Preparation(prepData) : null;

  // Calculate nutrition for this serving size
  let nutrition = prep?.nutritionalInformation ?? null;
  let scalar = 1;
  if (prep) {
    try {
      nutrition = prep.nutritionalInformationFor(servingSize);
      scalar = prep.scalar(servingSize);
    } catch {
      nutrition = prep.nutritionalInformation;
    }
  }

  const calories = nutrition?.calories?.amount;
  const mass = prep?.mass ? prep.mass.amount * scalar : null;
  const massUnit = prep?.mass?.unit;
  const volume = prep?.volume ? prep.volume.amount * scalar : null;
  const volumeUnit = prep?.volume?.unit;

  return (
    <div className="card mb-2">
      <div className="d-flex align-items-center">
        <div className="card-body">
          <span className="badge bg-secondary mb-1">Product</span>
          <h5 className="card-title mb-1">
            <Link to={`/products/${p.id}`}>{p.name}</Link>
          </h5>
          <p className="card-text text-secondary mb-1">{p.brand}</p>
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
            {scalar !== 1 && (
              <span className="text-secondary">
                ({formatSignificant(scalar)} serving{scalar !== 1 ? 's' : ''})
              </span>
            )}
          </div>
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
