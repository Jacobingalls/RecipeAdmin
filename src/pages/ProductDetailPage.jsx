import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { getProduct } from '../api';
import { useApiQuery } from '../hooks';
import { ServingSize } from '../domain';
import { LoadingState, ErrorState, EmptyState, BackButton } from '../components/common';
import { PreparationDetails } from '../components/product';
import BarcodeSection from '../components/BarcodeSection';
import NotesDisplay from '../components/NotesDisplay';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, loading, error } = useApiQuery(() => getProduct(id), [id]);
  const [selectedPrep, setSelectedPrep] = useState(null);
  const [servingSize, setServingSize] = useState(() => ServingSize.servings(1));

  const defaultPrepId = product?.defaultPreparationID || product?.preparations?.[0]?.id || null;
  const activePrep =
    selectedPrep && product?.preparations?.some((p) => p.id === selectedPrep)
      ? selectedPrep
      : defaultPrepId;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!product) return <EmptyState message="Product not found" />;

  const currentPrep = product.preparations.find((p) => p.id === activePrep);

  return (
    <>
      <BackButton to="/products" />
      <h1 className="mb-1">{product.name}</h1>
      <p className="text-secondary mb-3">{product.brand}</p>

      {product.notes?.length > 0 && (
        <div className="mb-3">
          <NotesDisplay notes={product.notes} />
        </div>
      )}

      <br />
      <h6 className="text-secondary mb-2">
        Preparation{product.preparations.length > 1 ? 's' : ''}
      </h6>
      {product.preparations.length > 0 && (
        <div className="card mb-3">
          {product.preparations.length > 1 && (
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                {product.preparations.map((prep) => (
                  <li className="nav-item" key={prep.id}>
                    <button
                      className={`nav-link d-flex align-items-center ${activePrep === prep.id ? 'active' : ''}`}
                      onClick={() => setSelectedPrep(prep.id)}
                    >
                      {prep.name}
                      {prep.id === product.defaultPreparationID && (
                        <span className="badge bg-primary ms-2">Default</span>
                      )}
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
              />
            </div>
          )}
        </div>
      )}

      {product.barcodes.length > 0 && (
        <>
          <br />
          <BarcodeSection barcodes={product.barcodes} onSelectSize={setServingSize} />
        </>
      )}
    </>
  );
}
