import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { ApiProduct } from '../api';
import { getProduct } from '../api';
import { ServingSize } from '../domain';
import { useApiQuery, useServingSizeParams } from '../hooks';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  CategoryPaths,
  SubsectionTitle,
} from '../components/common';
import { PreparationDetails } from '../components/product';
import BarcodeSection from '../components/BarcodeSection';
import NotesDisplay from '../components/NotesDisplay';
import AddToFavoritesButton from '../components/AddToFavoritesButton';
import AddToLogButton from '../components/AddToLogButton';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    data: product,
    loading,
    error,
  } = useApiQuery<ApiProduct>(() => getProduct(id!), [id], {
    errorMessage: t('product.error'),
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [urlServingSize, setServingSize] = useServingSizeParams();

  const selectedPrep = searchParams.get('prep');

  const setSelectedPrep = useCallback(
    (prepId: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (prepId) {
            next.set('prep', prepId);
          } else {
            next.delete('prep');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const defaultPrepId = product?.defaultPreparationID || product?.preparations?.[0]?.id || null;
  const activePrep =
    selectedPrep && product?.preparations?.some((p) => p.id === selectedPrep)
      ? selectedPrep
      : defaultPrepId;

  const preparations = product?.preparations ?? [];
  const barcodes = product?.barcodes ?? [];
  const currentPrep = preparations.find((p) => p.id === activePrep);

  const servingSize =
    urlServingSize ??
    ServingSize.fromObject(currentPrep?.defaultServingSize) ??
    ServingSize.servings(1);

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !product && (
        <ContentUnavailableView icon="bi-box-seam" title={t('product.notFound')} />
      )}
      {!loading && !error && product && (
        <>
          <p className="text-secondary mb-1">{product.brand}</p>
          <h1 className="mb-1">{product.name}</h1>
          <CategoryPaths categoryIds={currentPrep?.categories ?? []} />

          {product.notes?.length ? (
            <div className="mb-3">
              <NotesDisplay notes={product.notes} />
            </div>
          ) : null}

          <section className="mt-4">
            <SubsectionTitle>
              {t('product.preparations', { count: preparations.length })}
            </SubsectionTitle>
            {preparations.length > 0 && (
              <div className="card mb-3">
                {preparations.length > 1 && (
                  <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                      {preparations.map((prep) => (
                        <li className="nav-item" key={prep.id}>
                          <button
                            className={`nav-link ${activePrep === prep.id ? 'active' : ''}`}
                            onClick={() => setSelectedPrep(prep.id ?? null)}
                          >
                            {prep.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentPrep && (
                  <div className="card-body">
                    <PreparationDetails
                      prep={currentPrep}
                      servingSize={servingSize}
                      onServingSizeChange={setServingSize}
                      actionSlot={
                        <div className="d-flex gap-2">
                          <AddToLogButton
                            productId={product.id}
                            preparationId={currentPrep.id}
                            servingSize={servingSize}
                          />
                          <AddToFavoritesButton
                            productId={product.id}
                            preparationId={currentPrep.id}
                            servingSize={servingSize}
                          />
                        </div>
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {barcodes.length > 0 && (
            <BarcodeSection barcodes={barcodes} onSelectSize={setServingSize} />
          )}
        </>
      )}
    </>
  );
}
