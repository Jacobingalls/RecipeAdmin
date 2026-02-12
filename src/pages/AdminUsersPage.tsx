import type { FormEvent } from 'react';
import { useState, useMemo } from 'react';

import type { AdminCreateUserResponse } from '../api';
import { adminListUsers, adminCreateUser } from '../api';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  CopyButton,
  ModalBase,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  LinkListItem,
} from '../components/common';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<AdminCreateUserResponse | null>(null);

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

  function closeModal() {
    const wasCreated = !!createdResult;
    setShowCreateForm(false);
    setCreatedResult(null);
    if (wasCreated) refetch();
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    try {
      const result = await adminCreateUser(newUsername, newDisplayName, newEmail, newIsAdmin);
      setCreatedResult(result);
    } catch (err) {
      console.error("Couldn't create user", err);
      setCreateError("Couldn't create the user. Try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Users</h1>
        <Button
          variant="success"
          onClick={() => {
            setNewUsername('');
            setNewDisplayName('');
            setNewEmail('');
            setNewIsAdmin(false);
            setCreateError(null);
            setCreatedResult(null);
            setShowCreateForm(true);
          }}
        >
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

      {showCreateForm && (
        <ModalBase onClose={closeModal} ariaLabelledBy="create-user-modal-title">
          {createdResult ? (
            <>
              <ModalHeader onClose={closeModal} titleId="create-user-modal-title">
                User created
              </ModalHeader>
              <ModalBody>
                <div className="alert alert-success mb-0" role="status">
                  <p className="mb-2 small">
                    Temporary API key for <strong>{createdResult.user.username}</strong>. Save it
                    now — it expires in 24 hours and can&apos;t be retrieved later.
                  </p>
                  <div className="d-flex gap-2 align-items-center">
                    <code className="flex-grow-1 text-break">{createdResult.temporaryAPIKey}</code>
                    <CopyButton
                      text={createdResult.temporaryAPIKey}
                      className="btn btn-outline-success btn-sm"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onClick={closeModal}>Done</Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader onClose={closeModal} titleId="create-user-modal-title">
                Add User
              </ModalHeader>
              <form onSubmit={handleCreate}>
                <ModalBody>
                  {createError && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      {createError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="new-username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="new-username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-display-name" className="form-label">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="new-display-name"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="new-email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="new-is-admin"
                      checked={newIsAdmin}
                      onChange={(e) => setNewIsAdmin(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="new-is-admin">
                      Administrator
                    </label>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={isCreating}>
                    Add
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalBase>
      )}

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
