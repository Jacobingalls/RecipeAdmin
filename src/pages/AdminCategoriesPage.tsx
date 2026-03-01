import { useState, useMemo, useId } from 'react';

import type { ApiCategory } from '../api';
import { adminListCategories } from '../api';
import { useApiQuery } from '../hooks';
import { buildSlugPath } from '../utils';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  LinkListItem,
} from '../components/common';

function formatCounts(parents: number, children: number): string {
  const p = parents === 1 ? '1 parent' : `${parents} parents`;
  const c = children === 1 ? '1 child' : `${children} children`;
  return `${p} · ${c}`;
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

  const { filteredCategories, lookup } = useMemo(() => {
    if (!categories) return { filteredCategories: [], lookup: new Map<string, ApiCategory>() };
    const map = new Map(categories.map((c) => [c.id, c]));
    const sorted = [...categories].sort((a, b) => a.displayName.localeCompare(b.displayName));
    if (!nameFilter) return { filteredCategories: sorted, lookup: map };
    const q = nameFilter.toLowerCase();
    return {
      filteredCategories: sorted.filter((c) => c.displayName.toLowerCase().includes(q)),
      lookup: map,
    };
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
      {!loading && !error && filteredCategories.length === 0 && (
        <ContentUnavailableView
          icon="bi-folder"
          title="No categories"
          description="Try adjusting your search."
        />
      )}
      {!loading && !error && filteredCategories.length > 0 && (
        <div className="list-group">
          {filteredCategories.map((c) => (
            <LinkListItem
              key={c.id}
              to={`/admin/categories/${buildSlugPath(c.id, lookup)}`}
              title={c.displayName}
              subtitle={formatCounts(c.parents.length, c.children.length)}
            />
          ))}
        </div>
      )}
    </>
  );
}
