import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiProduct } from '../api';
import { adminListProducts } from '../api';
import { CreateProductModal } from '../components/admin';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  Button,
  LinkListItem,
  ListFilter,
} from '../components/common';
import { useApiQuery } from '../hooks';

export default function ProductsPage() {
  const navigate = useNavigate();
  const {
    data: products,
    loading,
    error,
  } = useApiQuery<ApiProduct[]>(adminListProducts, [], {
    errorMessage: "Couldn't load products. Try again later.",
  });
  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const brands = useMemo(() => {
    if (!products) return [];
    const uniqueBrands = [
      ...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b))),
    ];
    return uniqueBrands.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesName = !nameFilter || p.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesBrand = !brandFilter || p.brand === brandFilter;
      return matchesName && matchesBrand;
    });
  }, [products, nameFilter, brandFilter]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Products</h1>
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          New
        </Button>
      </div>

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={(id) => navigate(`/admin/products/${id}`)}
      />

      <ListFilter
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        dropdownFilter={brandFilter}
        onDropdownFilterChange={setBrandFilter}
        dropdownLabel="All brands"
        dropdownOptions={brands}
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filteredProducts.length === 0 && (
        <ContentUnavailableView
          icon="bi-box-seam"
          title="No products"
          description="Try adjusting your search or filters."
        />
      )}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="list-group">
          {filteredProducts.map((p) => (
            <LinkListItem
              key={p.id}
              to={`/admin/products/${p.id}`}
              title={p.name}
              subtitle={p.brand}
            />
          ))}
        </div>
      )}
    </>
  );
}
