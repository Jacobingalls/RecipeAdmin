import { Link } from 'react-router-dom';

import type { ApiCategory } from '../../api';

interface CategoryGridProps {
  categories: ApiCategory[];
  basePath?: string;
  parentPath?: string;
}

export default function CategoryGrid({
  categories,
  basePath = '/categories',
  parentPath,
}: CategoryGridProps) {
  return (
    <div className="category-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {categories.map((cat) => {
        const slugPath = parentPath ? `${parentPath}.${cat.slug}` : cat.slug;
        return (
          <div className="col" key={cat.id}>
            <Link
              to={`${basePath}/${slugPath}`}
              className="card list-group-item-action text-decoration-none h-100"
            >
              <div className="card-body">{cat.displayName}</div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
