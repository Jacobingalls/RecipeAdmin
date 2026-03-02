import { Link } from 'react-router-dom';

import type { ApiCategory } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { buildSlugPath, resolvePathSegments } from '../../utils';

type CategoryPathsProps =
  | { path: string; categoryIds?: never }
  | { categoryIds: string[]; path?: never };

function buildBreadcrumbs(
  resolved: ApiCategory[],
  basePath: string,
): { name: string; to: string }[] {
  return resolved.map((cat, i) => {
    const slugPath = resolved
      .slice(0, i + 1)
      .map((c) => c.slug)
      .join('.');
    return { name: cat.displayName, to: `${basePath}/${slugPath}` };
  });
}

export default function CategoryPaths(props: CategoryPathsProps) {
  const { allCategories, lookup } = useCategories();

  if (allCategories.length === 0) return null;

  const trails: { key: string; crumbs: { name: string; to: string }[] }[] = [];

  if (props.path !== undefined) {
    const resolved = resolvePathSegments(props.path, allCategories);
    if (resolved.length === 0) return null;
    trails.push({ key: props.path, crumbs: buildBreadcrumbs(resolved, '/categories') });
  } else {
    if (props.categoryIds.length === 0) return null;
    for (const id of props.categoryIds) {
      const slugPath = buildSlugPath(id, lookup);
      if (!slugPath) continue;
      const resolved = resolvePathSegments(slugPath, allCategories);
      if (resolved.length === 0) continue;
      trails.push({ key: id, crumbs: buildBreadcrumbs(resolved, '/categories') });
    }
  }

  if (trails.length === 0) return null;

  return (
    <div className="mb-2">
      {trails.map(({ key, crumbs }) => (
        <nav aria-label="Category" key={key}>
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <Link to="/categories" className="text-decoration-none">
                Categories
              </Link>
            </li>
            {crumbs.map((crumb, i) => (
              <li
                key={crumb.to}
                className={`breadcrumb-item${i === crumbs.length - 1 ? ' active' : ''}`}
                {...(i === crumbs.length - 1 ? { 'aria-current': 'page' as const } : {})}
              >
                <Link to={crumb.to} className="text-decoration-none">
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      ))}
    </div>
  );
}
