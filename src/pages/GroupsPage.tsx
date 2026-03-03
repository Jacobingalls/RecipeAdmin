import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ProductGroupData } from '../domain';
import { adminListGroups } from '../api';
import { useApiQuery } from '../hooks';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  LinkListItem,
  ListFilter,
  Button,
} from '../components/common';
import { CreateGroupModal } from '../components/admin';

export default function GroupsPage() {
  const navigate = useNavigate();
  const {
    data: groups,
    loading,
    error,
  } = useApiQuery<ProductGroupData[]>(adminListGroups, [], {
    errorMessage: "Couldn't load groups. Try again later.",
  });
  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Groups</h1>
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          New
        </Button>
      </div>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={(id) => navigate(`/admin/groups/${id}`)}
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
              subtitle={g.brand ?? `${g.items?.length ?? 0} item(s)`}
            />
          ))}
        </div>
      )}
    </>
  );
}
