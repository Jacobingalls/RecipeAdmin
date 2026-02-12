import { useState, useMemo } from 'react';

import type { ApiProductSummary } from '../api';
import { listProducts } from '../api';
import { useApiQuery } from '../hooks';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  LinkListItem,
} from '../components/common';

export default function ProductsPage() {
  const { data: products, loading, error } = useApiQuery<ApiProductSummary[]>(listProducts, []);
  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

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
      <h1 className="mb-4">Products</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="product-name-filter" className="visually-hidden">
            Filter by name
          </label>
          <input
            type="text"
            className="form-control"
            id="product-name-filter"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="product-brand-filter" className="visually-hidden">
            Filter by brand
          </label>
          <select
            className="form-select"
            id="product-brand-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>
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
            <LinkListItem key={p.id} to={`/products/${p.id}`} title={p.name} subtitle={p.brand} />
          ))}
        </div>
      )}
    </>
  );
}
