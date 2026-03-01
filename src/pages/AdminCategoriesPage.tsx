import { useState, useMemo, useId } from 'react';

import type { ApiCategory } from '../api';
import { adminListCategories } from '../api';
import { useApiQuery } from '../hooks';
import { buildAllSlugPaths } from '../utils';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  LinkListItem,
} from '../components/common';

interface CategoryEntry {
  category: ApiCategory;
  paths: string[];
  linkPath: string;
}

export default function AdminCategoriesPage() {
  const {
    data: categories,
    loading,
    error,
  } = useApiQuery<ApiCategory[]>(adminListCategories, [], {
    errorMessage: "Couldn't load categories. Try again later.",
  });
  const [nameFilter, setNameFilter] = useState('');
  const nameId = useId();

  const filteredEntries = useMemo(() => {
    if (!categories) return [];
    const lookup = new Map(categories.map((c) => [c.id, c]));

    const entries: CategoryEntry[] = categories
      .map((c) => {
        const paths = buildAllSlugPaths(c.id, lookup);
        return { category: c, paths, linkPath: paths[0] ?? c.slug };
      })
      .sort((a, b) => a.category.displayName.localeCompare(b.category.displayName));

    if (!nameFilter) return entries;
    const q = nameFilter.toLowerCase();
    return entries.filter(
      (e) =>
        e.category.displayName.toLowerCase().includes(q) ||
        e.paths.some((p) => p.toLowerCase().includes(q)),
    );
  }, [categories, nameFilter]);

  return (
    <>
      <h1 className="mb-4">Categories</h1>
      <div className="mb-4">
        <label htmlFor={nameId} className="visually-hidden">
          Filter by name
        </label>
        <input
          type="text"
          className="form-control"
          id={nameId}
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
      </div>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filteredEntries.length === 0 && (
        <ContentUnavailableView
          icon="bi-folder"
          title="No categories"
          description="Try adjusting your search."
        />
      )}
      {!loading && !error && filteredEntries.length > 0 && (
        <div className="list-group">
          {filteredEntries.map((e) => (
            <LinkListItem
              key={e.category.id}
              to={`/admin/categories/${e.linkPath}`}
              title={e.category.displayName}
              subtitle={e.paths.join(', ')}
            />
          ))}
        </div>
      )}
    </>
  );
}
