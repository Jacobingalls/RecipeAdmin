import { Link, useParams } from 'react-router-dom';

import { getProduct } from '../api';
import type { ApiProduct } from '../api';
import { useApiQuery } from '../hooks';
import { LoadingState, ErrorState, ContentUnavailableView } from '../components/common';

export default function AdminProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: product,
    loading,
    error,
  } = useApiQuery<ApiProduct>(() => getProduct(id!), [id], {
    errorMessage: "Couldn't load this product. Try again later.",
  });

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !product && (
        <ContentUnavailableView icon="bi-box-seam" title="Product not found" />
      )}
      {!loading && !error && product && (
        <>
          <h1 className="mb-1">{product.name}</h1>
          {product.brand && <p className="text-body-secondary mb-4">{product.brand}</p>}
          <ContentUnavailableView icon="bi-pencil-square" title="Coming soon" />
          <div className="text-center mt-3">
            <Link to={`/products/${id}`}>View product</Link>
          </div>
        </>
      )}
    </>
  );
}
