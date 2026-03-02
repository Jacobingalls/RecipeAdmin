import { useMemo, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import type { ApiCategory } from '../api';
import { adminGetCategory } from '../api';
import {
  AddCategoryModal,
  CategoryDangerZone,
  CategoryProfileForm,
  CategoryRelationSection,
  CreateCategoryModal,
} from '../components/admin-category-detail';
import { ContentUnavailableView, ErrorState, LoadingState } from '../components/common';
import { useCategories } from '../contexts/CategoriesContext';
import { useApiQuery } from '../hooks';
import { buildAllSlugPaths, buildSlugPath, resolvePathSegments } from '../utils';

type RelationType = 'parents' | 'children';
type ModalState =
  | { kind: 'add'; relationType: RelationType }
  | { kind: 'create'; relationType: RelationType }
  | null;

export default function AdminCategoryDetailPage() {
  const { path } = useParams<{ path: string }>();
  const { allCategories, lookup, addCategories } = useCategories();
  const [modal, setModal] = useState<ModalState>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Try to resolve from cache
  const cachedCategory = useMemo(() => {
    if (!path || allCategories.length === 0) return null;
    const resolved = resolvePathSegments(path, allCategories);
    return resolved.length > 0 ? resolved[resolved.length - 1] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, allCategories, refreshKey]);

  // Fetch from API only if not in cache
  const {
    data: fetchedCategory,
    loading: categoryLoading,
    error: categoryError,
  } = useApiQuery<ApiCategory>(() => adminGetCategory(path!), [path], {
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

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

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

          <CategoryProfileForm category={category} onSaved={handleSaved} />

          <CategoryRelationSection
            category={category}
            relationType="parents"
            relatedCategories={parentCategories}
            linkFor={(c) => `/admin/categories/${buildSlugPath(c.id, lookup)}`}
            onAdd={() => setModal({ kind: 'add', relationType: 'parents' })}
            onCreateNew={() => setModal({ kind: 'create', relationType: 'parents' })}
            onSaved={handleSaved}
          />

          <CategoryRelationSection
            category={category}
            relationType="children"
            relatedCategories={childCategories}
            linkFor={(c) => `/admin/categories/${path}.${c.slug}`}
            onAdd={() => setModal({ kind: 'add', relationType: 'children' })}
            onCreateNew={() => setModal({ kind: 'create', relationType: 'children' })}
            onSaved={handleSaved}
          />

          <CategoryDangerZone category={category} />

          {modal?.kind === 'add' && (
            <AddCategoryModal
              category={category}
              relationType={modal.relationType}
              onClose={closeModal}
              onSaved={handleSaved}
            />
          )}

          {modal?.kind === 'create' && (
            <CreateCategoryModal
              category={category}
              relationType={modal.relationType}
              onClose={closeModal}
              onSaved={handleSaved}
            />
          )}
        </>
      )}
    </>
  );
}
