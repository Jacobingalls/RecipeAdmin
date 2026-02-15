import { useState, useMemo } from 'react';

import type { ApiGroupSummary } from '../api';
import { listGroups } from '../api';
import { useApiQuery } from '../hooks';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  LinkListItem,
} from '../components/common';

export default function GroupsPage() {
  const {
    data: groups,
    loading,
    error,
  } = useApiQuery<ApiGroupSummary[]>(listGroups, [], {
    errorMessage: "Couldn't load groups. Try again later.",
  });
  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const brands = useMemo(() => {
    if (!groups) return [];
    const uniqueBrands = [
      ...new Set(groups.map((g) => g.brand).filter((b): b is string => Boolean(b))),
    ];
    return uniqueBrands.sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    return groups.filter((g) => {
      const matchesName = !nameFilter || g.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesBrand = !brandFilter || g.brand === brandFilter;
      return matchesName && matchesBrand;
    });
  }, [groups, nameFilter, brandFilter]);

  return (
    <>
      <h1 className="mb-4">Groups</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="group-name-filter" className="visually-hidden">
            Filter by name
          </label>
          <input
            type="text"
            className="form-control"
            id="group-name-filter"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="group-brand-filter" className="visually-hidden">
            Filter by brand
          </label>
          <select
            className="form-select"
            id="group-brand-filter"
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
      {!loading && !error && filteredGroups.length === 0 && (
        <ContentUnavailableView
          icon="bi-collection"
          title="No groups"
          description="Try adjusting your search or filters."
        />
      )}
      {!loading && !error && filteredGroups.length > 0 && (
        <div className="list-group">
          {filteredGroups.map((g) => (
            <LinkListItem
              key={g.id}
              to={`/admin/groups/${g.id}`}
              title={g.name}
              subtitle={g.brand ?? `${g.items.length} item(s)`}
            />
          ))}
        </div>
      )}
    </>
  );
}
