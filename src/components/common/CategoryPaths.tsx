import { Link } from 'react-router-dom';

import type { ApiCategory } from '../../api';
import { listCategories } from '../../api';
import { useApiQuery } from '../../hooks';

interface CategoryPathsProps {
  categoryIds: string[];
}

function buildAncestorPath(categoryId: string, lookup: Map<string, ApiCategory>): ApiCategory[] {
  const path: ApiCategory[] = [];
  let current = lookup.get(categoryId);
  while (current) {
    path.unshift(current);
    const parentId = current.parents[0];
    current = parentId ? lookup.get(parentId) : undefined;
  }
  return path;
}

export default function CategoryPaths({ categoryIds }: CategoryPathsProps) {
  const { data: allCategories } = useApiQuery(listCategories, []);

  if (!allCategories || categoryIds.length === 0) return null;

  const lookup = new Map(allCategories.map((c) => [c.id, c]));

  return (
    <div className="mb-2">
      {categoryIds.map((id) => {
        const path = buildAncestorPath(id, lookup);
        if (path.length === 0) return null;

        return (
          <nav aria-label="Category" key={id}>
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item">
                <Link to="/categories" className="text-decoration-none">
                  Categories
                </Link>
              </li>
              {path.map((cat, i) => (
                <li
                  key={cat.id}
                  className={`breadcrumb-item${i === path.length - 1 ? ' active' : ''}`}
                  {...(i === path.length - 1 ? { 'aria-current': 'page' as const } : {})}
                >
                  <Link to={`/categories/${cat.id}`} className="text-decoration-none">
                    {cat.displayName}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        );
      })}
    </div>
  );
}
