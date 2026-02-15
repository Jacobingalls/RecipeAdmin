import { useState, useMemo } from 'react';

import { adminListUsers } from '../api';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  Button,
  LinkListItem,
  ListFilter,
} from '../components/common';
import { CreateUserModal } from '../components/admin';
import { useApiQuery } from '../hooks';
import { formatLastLogin } from '../utils';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admins' },
  { value: 'normal', label: 'Normal users' },
];

export default function AdminUsersPage() {
  const {
    data: users,
    loading,
    error,
    refetch,
  } = useApiQuery(adminListUsers, [], {
    errorMessage: "Couldn't load users. Try again later.",
  });
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const query = nameFilter.toLowerCase();
      const matchesName =
        !nameFilter ||
        u.displayName.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);
      const matchesRole =
        !roleFilter ||
        (roleFilter === 'admin' && u.isAdmin) ||
        (roleFilter === 'normal' && !u.isAdmin);
      return matchesName && matchesRole;
    });
  }, [users, nameFilter, roleFilter]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Users</h1>
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          New
        </Button>
      </div>

      <ListFilter
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        nameLabel="Search users"
        namePlaceholder="Search users..."
        nameColumnClass="col-md-8"
        dropdownFilter={roleFilter}
        onDropdownFilterChange={setRoleFilter}
        dropdownLabel="All users"
        dropdownOptions={ROLE_OPTIONS}
        dropdownColumnClass="col-md-4"
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={refetch}
      />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && filteredUsers.length === 0 && (
        <ContentUnavailableView
          icon="bi-people"
          title="No users"
          description="Try adjusting your search or filters."
        />
      )}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="list-group">
          {filteredUsers.map((u) => (
            <LinkListItem
              key={u.id}
              to={`/admin/users/${u.id}`}
              icon={u.isAdmin ? 'bi-shield-lock' : 'bi-person'}
              title={<strong>{u.displayName}</strong>}
              subtitle={
                <>
                  {u.username}
                  <span className="mx-1">&middot;</span>
                  {u.email}
                </>
              }
              trailing={
                <div className="text-body-secondary small">{formatLastLogin(u.lastLoginAt)}</div>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
