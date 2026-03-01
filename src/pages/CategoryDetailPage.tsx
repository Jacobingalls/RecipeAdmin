import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ApiCategory, ApiLookupItem } from '../api';
import { getCategory, getCategoryChildren, getCategoryItems } from '../api';
import {
  CategoryGrid,
  CategoryPaths,
  ContentUnavailableView,
  ErrorState,
  LoadingState,
  SubsectionTitle,
} from '../components/common';
import { GroupItemRow } from '../components/group';
import { useApiQuery } from '../hooks';

export default function CategoryDetailPage() {
  const { path } = useParams<{ path: string }>();
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const [nameFilter, setNameFilter] = useState('');

  const {
    data: category,
    loading: categoryLoading,
    error: categoryError,
  } = useApiQuery<ApiCategory>(() => getCategory(path!), [path], {
    errorMessage: "Couldn't load this category. Try again later.",
  });

  const { data: children } = useApiQuery<ApiCategory[]>(() => getCategoryChildren(path!), [path]);

  const { data: items, loading: itemsLoading } = useApiQuery<ApiLookupItem[]>(
    () => getCategoryItems(path!, { includeDescendants }),
    [path, includeDescendants],
  );

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!nameFilter.trim()) return items;
    const q = nameFilter.toLowerCase();
    return items.filter((item) => {
      const name = item.product?.name ?? item.group?.name ?? '';
      return name.toLowerCase().includes(q);
    });
  }, [items, nameFilter]);

  const loading = categoryLoading;
  const error = categoryError;

  let emptyDescription = "Nothing's been added to this category.";
  if (nameFilter.trim()) {
    emptyDescription = 'Try adjusting your search.';
  } else if (includeDescendants) {
    emptyDescription = "Nothing's been added to this category or its subcategories.";
  }

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !category && (
        <ContentUnavailableView icon="bi-folder" title="Category not found" />
      )}
      {!loading && !error && category && (
        <>
          <h1 className="mb-1">{category.displayName}</h1>
          <CategoryPaths path={path!} />

          {children && children.length > 0 && (
            <section className="mt-4">
              <SubsectionTitle>Subcategories</SubsectionTitle>
              <CategoryGrid
                categories={[...children].sort((a, b) =>
                  a.displayName.localeCompare(b.displayName),
                )}
                parentPath={path}
              />
            </section>
          )}

          <section className="mt-4">
            <SubsectionTitle>Items</SubsectionTitle>
            <div className="d-flex align-items-center gap-3 mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Filter items..."
                aria-label="Filter items"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
              <div className="form-check text-nowrap">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="include-descendants"
                  checked={includeDescendants}
                  onChange={(e) => setIncludeDescendants(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="include-descendants">
                  Include descendants
                </label>
              </div>
            </div>

            {itemsLoading && <LoadingState />}
            {!itemsLoading && filteredItems.length === 0 && (
              <ContentUnavailableView
                icon="bi-tray"
                title="No items"
                description={emptyDescription}
              />
            )}
            {!itemsLoading && filteredItems.length > 0 && (
              <div className="list-group">
                {filteredItems.map((item) => (
                  <GroupItemRow key={item.product?.id ?? item.group?.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
