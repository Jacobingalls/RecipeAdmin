import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import type { ApiCategory } from '../api';
import { getCategory } from '../api';
import { useCategories } from '../contexts/CategoriesContext';
import { useApiQuery } from '../hooks';
import { buildAllSlugPaths, buildSlugPath, resolvePathSegments } from '../utils';
import {
  ContentUnavailableView,
  ErrorState,
  LinkListItem,
  LoadingState,
  SubsectionTitle,
} from '../components/common';

export default function AdminCategoryDetailPage() {
  const { path } = useParams<{ path: string }>();
  const { allCategories, lookup, addCategories } = useCategories();

  // Try to resolve from cache
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
    errorMessage: "Couldn't load this category. Try again later.",
  });

  // Merge fetched category into cache
  useEffect(() => {
    if (fetchedCategory) {
      addCategories([fetchedCategory]);
    }
  }, [fetchedCategory, addCategories]);

  const category = cachedCategory ?? fetchedCategory;

  const allPaths = useMemo(() => {
    if (!category || lookup.size === 0) return [];
    return buildAllSlugPaths(category.id, lookup);
  }, [category, lookup]);

  const parentCategories = useMemo(() => {
    if (!category) return [];
    return category.parents
      .map((pid) => lookup.get(pid))
      .filter((c): c is ApiCategory => c !== undefined)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [category, lookup]);

  const childCategories = useMemo(() => {
    if (!category) return [];
    return category.children
      .map((cid) => lookup.get(cid))
      .filter((c): c is ApiCategory => c !== undefined)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [category, lookup]);

  const loading = !cachedCategory && categoryLoading;
  const error = !cachedCategory ? categoryError : null;

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
          {allPaths.length > 0 && (
            <div className="mb-0">
              {allPaths.map((p) => (
                <p key={p} className="text-body-tertiary small font-monospace mb-0">
                  {p}
                </p>
              ))}
            </div>
          )}
          {category.description && <p className="mt-2 mb-0">{category.description}</p>}

          <section className="mt-4">
            <SubsectionTitle>Parents</SubsectionTitle>
            {parentCategories.length > 0 ? (
              <div className="list-group">
                {parentCategories.map((c) => (
                  <LinkListItem
                    key={c.id}
                    to={`/admin/categories/${buildSlugPath(c.id, lookup)}`}
                    title={c.displayName}
                  />
                ))}
              </div>
            ) : (
              <p className="text-body-secondary small mb-0">No parents</p>
            )}
          </section>

          <section className="mt-4">
            <SubsectionTitle>Children</SubsectionTitle>
            {childCategories.length > 0 ? (
              <div className="list-group">
                {childCategories.map((c) => (
                  <LinkListItem
                    key={c.id}
                    to={`/admin/categories/${path}.${c.slug}`}
                    title={c.displayName}
                  />
                ))}
              </div>
            ) : (
              <p className="text-body-secondary small mb-0">No children</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
