import { Link } from 'react-router-dom';

import type { ApiCategory } from '../../api';

interface CategoryGridProps {
  categories: ApiCategory[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="category-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {categories.map((cat) => (
        <div className="col" key={cat.id}>
          <Link
            to={`/categories/${cat.id}`}
            className="card list-group-item-action text-decoration-none h-100"
          >
            <div className="card-body">{cat.displayName}</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
