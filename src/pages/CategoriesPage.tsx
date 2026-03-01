import { useMemo } from 'react';

import type { ApiCategory } from '../api';
import { listCategories } from '../api';
import { useApiQuery } from '../hooks';
import {
  CategoryGrid,
  LoadingState,
  ErrorState,
  ContentUnavailableView,
} from '../components/common';

export default function CategoriesPage() {
  const {
    data: categories,
    loading,
    error,
  } = useApiQuery<ApiCategory[]>(listCategories, [], {
    errorMessage: "Couldn't load categories. Try again later.",
  });

  const { topLevel, lookup } = useMemo(() => {
    if (!categories) return { topLevel: [], lookup: new Map<string, ApiCategory>() };
    const map = new Map(categories.map((c) => [c.id, c]));
    const roots = categories.filter((c) => c.parents.length === 0);
    return { topLevel: roots, lookup: map };
  }, [categories]);

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
            .filter((c): c is ApiCategory => c !== undefined);

          return (
            <section key={root.id} className="mb-4">
              <h2 className="h6 mb-2" style={{ opacity: 0.9 }}>
                {root.displayName}
              </h2>
              {children.length > 0 ? (
                <CategoryGrid categories={children} />
              ) : (
                <p className="text-body-secondary small mb-0">No subcategories</p>
              )}
            </section>
          );
        })}
    </>
  );
}
