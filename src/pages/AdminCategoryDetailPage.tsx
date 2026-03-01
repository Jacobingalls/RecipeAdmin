import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { ApiCategory } from '../api';
import { getCategory, adminListCategories } from '../api';
import { useApiQuery } from '../hooks';
import { buildAllSlugPaths, buildSlugPath } from '../utils';
import {
  ContentUnavailableView,
  ErrorState,
  LinkListItem,
  LoadingState,
  SubsectionTitle,
} from '../components/common';

export default function AdminCategoryDetailPage() {
  const { path } = useParams<{ path: string }>();

  const {
    data: category,
    loading: categoryLoading,
    error: categoryError,
  } = useApiQuery<ApiCategory>(() => getCategory(path!), [path], {
    errorMessage: "Couldn't load this category. Try again later.",
  });

  const { data: allCategories } = useApiQuery<ApiCategory[]>(adminListCategories, []);

  const lookup = useMemo(() => {
    if (!allCategories) return new Map<string, ApiCategory>();
    return new Map(allCategories.map((c) => [c.id, c]));
  }, [allCategories]);

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

  const loading = categoryLoading;
  const error = categoryError;

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
