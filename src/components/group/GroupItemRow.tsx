import { Link } from 'react-router-dom';

import type { GroupItem } from '../../domain';
import { ServingSize } from '../../domain';

interface GroupItemRowProps {
  item: GroupItem;
}

export default function GroupItemRow({ item }: GroupItemRowProps) {
  const servingSizeObj = item.servingSize ? ServingSize.fromObject(item.servingSize) : null;
  const servingSizeDisplay = servingSizeObj ? servingSizeObj.toString() : null;

  if (item.product) {
    const { product } = item;
    return (
      <Link to={`/products/${product.id}`} className="list-group-item list-group-item-action">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-primary me-2">Product</span>
            <span className="fw-medium">{product.name}</span>
            {product.brand && <span className="text-secondary ms-2 small">{product.brand}</span>}
          </div>
          {servingSizeDisplay && <span className="text-secondary small">{servingSizeDisplay}</span>}
        </div>
      </Link>
    );
  }

  if (item.group) {
    const { group } = item;
    return (
      <Link to={`/groups/${group.id}`} className="list-group-item list-group-item-action">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-secondary me-2">Group</span>
            <span className="fw-medium">{group.name}</span>
            {group.brand && <span className="text-secondary ms-2 small">{group.brand}</span>}
          </div>
          {servingSizeDisplay && <span className="text-secondary small">{servingSizeDisplay}</span>}
        </div>
      </Link>
    );
  }

  return null;
}
