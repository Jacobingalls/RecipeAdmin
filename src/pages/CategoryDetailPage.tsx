import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
import { useCategories } from '../contexts/CategoriesContext';
import { useApiQuery } from '../hooks';
import { resolvePathSegments } from '../utils';

export default function CategoryDetailPage() {
  const { t } = useTranslation();
  const { path } = useParams<{ path: string }>();
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const [nameFilter, setNameFilter] = useState('');

  const { allCategories, lookup, addCategories } = useCategories();

  // Try to resolve category from cache first
  const cachedCategory = useMemo(() => {
    if (!path || allCategories.length === 0) return null;
    const resolved = resolvePathSegments(path, allCategories);
    return resolved.length > 0 ? resolved[resolved.length - 1] : null;
  }, [path, allCategories]);

  // Fetch from API only if not in cache
  const {
    data: fetchedCategory,
    loading: categoryLoading,
    error: categoryError,
  } = useApiQuery<ApiCategory>(() => getCategory(path!), [path], {
    enabled: !cachedCategory,
    errorMessage: t('category.error'),
  });

  // Merge fetched category into cache
  useEffect(() => {
    if (fetchedCategory) {
      addCategories([fetchedCategory]);
    }
  }, [fetchedCategory, addCategories]);

  const category = cachedCategory ?? fetchedCategory;

  // Check if all child IDs are already in the cache
  const childrenCached = useMemo(() => {
    if (!category) return false;
    return category.children.every((id) => lookup.has(id));
  }, [category, lookup]);

  // Fetch children only if not all are in cache
  const { data: fetchedChildren } = useApiQuery<ApiCategory[]>(
    () => getCategoryChildren(path!),
    [path],
    { enabled: !!category && !childrenCached },
  );

  // Merge fetched children into cache
  useEffect(() => {
    if (fetchedChildren && fetchedChildren.length > 0) {
      addCategories(fetchedChildren);
    }
  }, [fetchedChildren, addCategories]);

  // Resolve children from cache
  const children = useMemo(() => {
    if (!category) return [];
    return category.children
      .map((id) => lookup.get(id))
      .filter((c): c is ApiCategory => c !== undefined)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [category, lookup]);

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

  const loading = !cachedCategory && categoryLoading;
  const error = !cachedCategory ? categoryError : null;

  let emptyDescription = t('category.noItems.description');
  if (nameFilter.trim()) {
    emptyDescription = t('list.adjustSearch');
  } else if (includeDescendants) {
    emptyDescription = t('category.noItems.withDescendants');
  }

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !category && (
        <ContentUnavailableView icon="bi-folder" title={t('category.notFound')} />
      )}
      {!loading && !error && category && (
        <>
          <h1 className="mb-1">{category.displayName}</h1>
          <CategoryPaths path={path!} />

          {children && children.length > 0 && (
            <section className="mt-4">
              <SubsectionTitle>{t('category.subcategories')}</SubsectionTitle>
              <CategoryGrid
                categories={[...children].sort((a, b) =>
                  a.displayName.localeCompare(b.displayName),
                )}
                parentPath={path}
              />
            </section>
          )}

          <section className="mt-4">
            <SubsectionTitle>{t('category.items')}</SubsectionTitle>
            <div className="d-flex align-items-center gap-3 mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={t('category.filterPlaceholder')}
                aria-label={t('category.filterLabel')}
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
                  {t('category.includeDescendants')}
                </label>
              </div>
            </div>

            {itemsLoading && <LoadingState />}
            {!itemsLoading && filteredItems.length === 0 && (
              <ContentUnavailableView
                icon="bi-tray"
                title={t('category.noItems.title')}
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
