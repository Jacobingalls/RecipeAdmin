import { useState, useMemo } from 'react';

import { adminListUsers } from '../api';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  Button,
  LinkListItem,
} from '../components/common';
import { CreateUserModal } from '../components/admin';
import { useApiQuery } from '../hooks';
import { formatLastLogin } from '../utils/formatters';

type RoleFilter = 'all' | 'admin' | 'normal';

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
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
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
        roleFilter === 'all' ||
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

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <label htmlFor="user-name-filter" className="visually-hidden">
            Search users
          </label>
          <input
            type="text"
            className="form-control"
            id="user-name-filter"
            placeholder="Search users..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="user-role-filter" className="visually-hidden">
            Filter by role
          </label>
          <select
            className="form-select"
            id="user-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          >
            <option value="all">All users</option>
            <option value="admin">Admins</option>
            <option value="normal">Normal users</option>
          </select>
        </div>
      </div>

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
