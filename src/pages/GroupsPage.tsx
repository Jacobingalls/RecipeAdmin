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
  const { data: groups, loading, error } = useApiQuery<ApiGroupSummary[]>(listGroups, []);
  const [nameFilter, setNameFilter] = useState('');

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!nameFilter) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(nameFilter.toLowerCase()));
  }, [groups, nameFilter]);

  return (
    <>
      <h1 className="mb-4">Groups</h1>
      <div className="mb-4">
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
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filteredGroups.length === 0 && (
        <ContentUnavailableView
          icon="bi-collection"
          title="No Groups"
          description="Try adjusting your search"
        />
      )}
      {!loading && !error && filteredGroups.length > 0 && (
        <div className="list-group">
          {filteredGroups.map((g) => (
            <LinkListItem
              key={g.id}
              to={`/groups/${g.id}`}
              title={g.name}
              subtitle={`${g.items.length} item(s)`}
            />
          ))}
        </div>
      )}
    </>
  );
}
