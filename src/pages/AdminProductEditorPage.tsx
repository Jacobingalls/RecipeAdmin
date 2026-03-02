import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { ApiProduct } from '../api';
import { getProduct, adminUpsertProducts } from '../api';
import { useApiQuery } from '../hooks';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  SectionHeader,
  Button,
} from '../components/common';
import type { Note } from '../components/NotesDisplay';
import {
  ProductProfileForm,
  ProductDangerZone,
  PreparationCardBody,
  BarcodesSection,
  AddPreparationModal,
  NotesSection,
} from '../components/admin-product-editor';

export default function AdminProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useApiQuery<ApiProduct>(() => getProduct(id!), [id], {
    errorMessage: "Couldn't load this product. Try again later.",
  });

  const [draftProduct, setDraftProduct] = useState<ApiProduct | null>(null);
  const [activePrep, setActivePrep] = useState<string | null>(null);
  const [showAddPrep, setShowAddPrep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setDraftProduct(structuredClone(data));
    }
  }, [data]);

  const product = draftProduct;

  const isDirty = useMemo(() => {
    if (!data || !draftProduct) return false;
    return JSON.stringify(data) !== JSON.stringify(draftProduct);
  }, [data, draftProduct]);

  function handleDraftChange(updatedProduct: ApiProduct) {
    // Auto-detect deleted preparation: reset active tab
    if (activePrep && !updatedProduct.preparations.some((p) => p.id === activePrep)) {
      setActivePrep(null);
    }

    // Auto-detect new preparation: switch to new tab
    if (draftProduct) {
      const newPrep = updatedProduct.preparations.find(
        (p) => !draftProduct.preparations.some((dp) => dp.id === p.id),
      );
      if (newPrep?.id) {
        setActivePrep(newPrep.id);
      }
    }

    setDraftProduct(updatedProduct);
  }

  async function handleSave() {
    if (!draftProduct) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await adminUpsertProducts(draftProduct);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (data) {
      setDraftProduct(structuredClone(data));
      setSaveError(null);
    }
  }

  const preparations = product?.preparations ?? [];
  const notes = (product?.notes ?? []) as Note[];
  const defaultPrepId = product?.defaultPreparationID ?? preparations[0]?.id;
  const activePrepId = activePrep ?? defaultPrepId;

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !product && (
        <ContentUnavailableView icon="bi-box-seam" title="Product not found" />
      )}
      {!loading && !error && product && (
        <>
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <h1 className="mb-1">{product.name}</h1>
              {product.brand && <p className="text-body-secondary mb-0">{product.brand}</p>}
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
          {product.brand ? <div className="mb-4" /> : <div className="mb-3" />}

          {saveError && (
            <div className="alert alert-danger py-2 small" role="alert">
              {saveError}
            </div>
          )}

          <ProductProfileForm product={product} onChange={handleDraftChange} />

          <SectionHeader title="Preparations" className="mt-5">
            <Button size="sm" variant="dark" onClick={() => setShowAddPrep(true)}>
              Add
            </Button>
          </SectionHeader>

          {preparations.length > 0 ? (
            <div className="card mb-3">
              {preparations.length > 1 && (
                <div className="card-header">
                  <ul className="nav nav-tabs card-header-tabs">
                    {preparations.map((prep) => (
                      <li className="nav-item" key={prep.id}>
                        <button
                          type="button"
                          className={`nav-link${activePrepId === prep.id ? ' active' : ''}`}
                          onClick={() => setActivePrep(prep.id ?? null)}
                        >
                          {prep.name || 'Default'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activePrepId && (
                <div className="card-body p-0">
                  <PreparationCardBody
                    product={product}
                    preparationId={activePrepId}
                    onChange={handleDraftChange}
                    onPrepDeleted={() => setActivePrep(null)}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-body-secondary small">No preparations</p>
          )}

          <BarcodesSection product={product} onChange={handleDraftChange} />

          <NotesSection
            notes={notes}
            onChange={(updated) => handleDraftChange({ ...product, notes: updated })}
            className="mt-5"
          />

          <ProductDangerZone product={product} />

          {showAddPrep && (
            <AddPreparationModal
              product={product}
              onChange={handleDraftChange}
              onClose={() => setShowAddPrep(false)}
            />
          )}
        </>
      )}
    </>
  );
}
