import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { adminGetGroup, adminUpsertGroups, resolveIndirectGroup } from '../api';
import type { IndirectGroup } from '../api';
import type { ProductGroupData } from '../domain';
import type { Note } from '../components/NotesDisplay';
import { useApiQuery } from '../hooks';
import { LoadingState, ErrorState, ContentUnavailableView, Button } from '../components/common';
import { NotesSection } from '../components/admin-product-editor';
import {
  GroupProfileForm,
  GroupServingSection,
  GroupItemsSection,
  GroupCustomSizesSection,
  GroupCategoriesSection,
  GroupBarcodesSection,
  GroupDangerZone,
} from '../components/admin-group-editor';

export default function AdminGroupEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: indirectData,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useApiQuery<IndirectGroup>(() => adminGetGroup(id!), [id], {
    errorMessage: "Couldn't load this group. Try again later.",
  });

  const [data, setData] = useState<ProductGroupData | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    if (!indirectData) {
      setData(null);
      return;
    }
    let cancelled = false;
    setResolving(true);
    setResolveError(null);
    resolveIndirectGroup(indirectData)
      .then((resolved) => {
        if (!cancelled) setData(resolved);
      })
      .catch((err) => {
        if (!cancelled) {
          setResolveError(err instanceof Error ? err.message : "Couldn't resolve group items.");
        }
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [indirectData]);

  const loading = fetchLoading || resolving;
  const error = fetchError ?? resolveError;

  const [draftGroup, setDraftGroup] = useState<ProductGroupData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setDraftGroup(structuredClone(data));
    }
  }, [data]);

  const group = draftGroup;

  const isDirty = useMemo(() => {
    if (!data || !draftGroup) return false;
    return JSON.stringify(data) !== JSON.stringify(draftGroup);
  }, [data, draftGroup]);

  function handleDraftChange(updatedGroup: ProductGroupData) {
    setDraftGroup(updatedGroup);
  }

  async function handleSave() {
    if (!draftGroup) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await adminUpsertGroups(draftGroup);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (data) {
      setDraftGroup(structuredClone(data));
      setSaveError(null);
    }
  }

  const notes = (group?.notes ?? []) as Note[];

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !group && (
        <ContentUnavailableView icon="bi-collection" title="Group not found" />
      )}
      {!loading && !error && group && (
        <>
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <h1 className="mb-1">{group.name}</h1>
              {group.brand && <p className="text-body-secondary mb-0">{group.brand}</p>}
            </div>
            {isDirty && (
              <div className="d-flex gap-2 flex-shrink-0 ms-3">
                <Button variant="outline-secondary" onClick={handleDiscard} disabled={isSaving}>
                  Discard
                </Button>
                <Button onClick={handleSave} loading={isSaving}>
                  Save
                </Button>
              </div>
            )}
          </div>
          {group.brand ? <div className="mb-4" /> : <div className="mb-3" />}

          {saveError && (
            <div className="alert alert-danger py-2 small" role="alert">
              {saveError}
            </div>
          )}

          <GroupProfileForm group={group} onChange={handleDraftChange} />

          <GroupItemsSection group={group} onChange={handleDraftChange} />

          <GroupServingSection group={group} onChange={handleDraftChange} />

          <GroupCustomSizesSection group={group} onChange={handleDraftChange} />

          <GroupCategoriesSection group={group} onChange={handleDraftChange} />

          <GroupBarcodesSection group={group} onChange={handleDraftChange} />

          <NotesSection
            notes={notes}
            onChange={(updated) => handleDraftChange({ ...group, notes: updated })}
            className="mt-5"
          />

          <GroupDangerZone group={group} />
        </>
      )}
    </>
  );
}
