import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { ApiProductSummary } from '../api';
import { listProducts } from '../api';
import { useApiQuery } from '../hooks';
import { LoadingState, ErrorState, EmptyState } from '../components/common';

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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      <h1 className="mb-4">Products</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
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
      {filteredProducts.length === 0 ? (
        <EmptyState message="No products found" />
      ) : (
        <div className="list-group">
          {filteredProducts.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="list-group-item list-group-item-action"
            >
              <div className="fw-bold">{p.name}</div>
              <small className="text-secondary">{p.brand}</small>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
