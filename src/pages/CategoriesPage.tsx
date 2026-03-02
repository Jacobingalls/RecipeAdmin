import { useMemo } from 'react';

import type { ApiCategory } from '../api';
import {
  CategoryGrid,
  LoadingState,
  ErrorState,
  ContentUnavailableView,
} from '../components/common';
import { useCategories } from '../contexts/CategoriesContext';

export default function CategoriesPage() {
  const { allCategories: categories, lookup, loading, error } = useCategories();

  const topLevel = useMemo(
    () =>
      categories
        .filter((c) => c.parents.length === 0)
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [categories],
  );

  return (
    <>
      <h1 className="mb-4">Categories</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && topLevel.length === 0 && (
        <ContentUnavailableView icon="bi-folder" title="No categories" />
      )}
      {!loading &&
        !error &&
        topLevel.map((root) => {
          const children = root.children
            .map((id) => lookup.get(id))
            .filter((c): c is ApiCategory => c !== undefined)
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

          return (
            <section key={root.id} className="mb-4">
              <h2 className="h6 mb-2" style={{ opacity: 0.9 }}>
                {root.displayName}
              </h2>
              {children.length > 0 ? (
                <CategoryGrid categories={children} parentPath={root.slug} />
              ) : (
                <p className="text-body-secondary small mb-0">No subcategories</p>
              )}
            </section>
          );
        })}
    </>
  );
}
