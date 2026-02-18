import { useState, useMemo } from 'react';

import type { ApiProduct } from '../api';
import { listProducts } from '../api';
import { useApiQuery } from '../hooks';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  LinkListItem,
  ListFilter,
} from '../components/common';

export default function ProductsPage() {
  const {
    data: products,
    loading,
    error,
  } = useApiQuery<ApiProduct[]>(listProducts, [], {
    errorMessage: "Couldn't load products. Try again later.",
  });
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
