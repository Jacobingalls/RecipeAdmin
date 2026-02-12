import type { FormEvent, ReactNode } from 'react';
import { useState, useEffect } from 'react';

import { adminUpdateUser } from '../../api';
import { SectionHeader, Button } from '../common';

interface AdminUserProfileFormProps {
  userId: string;
  initialUser: {
    username: string;
    displayName: string;
    email: string;
    isAdmin: boolean;
  };
  onSaved: () => void;
}

function InlineFormField({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="list-group-item d-flex align-items-center justify-content-between py-3"
    >
      <span className="me-3 flex-shrink-0">{label}</span>
      {children}
    </label>
  );
}

export default function AdminUserProfileForm({
  userId,
  initialUser,
  onSaved,
}: AdminUserProfileFormProps) {
  const [editUsername, setEditUsername] = useState(initialUser.username);
  const [editDisplayName, setEditDisplayName] = useState(initialUser.displayName);
  const [editEmail, setEditEmail] = useState(initialUser.email);
  const [editIsAdmin, setEditIsAdmin] = useState(initialUser.isAdmin);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setEditUsername(initialUser.username);
    setEditDisplayName(initialUser.displayName);
    setEditEmail(initialUser.email);
    setEditIsAdmin(initialUser.isAdmin);
  }, [initialUser.username, initialUser.displayName, initialUser.email, initialUser.isAdmin]);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    setIsEditing(true);
    try {
      await adminUpdateUser(userId, {
        username: editUsername,
        displayName: editDisplayName,
        email: editEmail,
        isAdmin: editIsAdmin,
      });
      onSaved();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <>
      <SectionHeader title="Profile" className="mt-5">
        <Button type="submit" form="edit-user-form" size="sm" disabled={isEditing}>
          {isEditing ? 'Saving...' : 'Save'}
        </Button>
      </SectionHeader>
      {editError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {editError}
        </div>
      )}
      <form id="edit-user-form" onSubmit={handleUpdate}>
        <div className="list-group">
          <InlineFormField htmlFor="edit-username" label="Username">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-username"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              required
            />
          </InlineFormField>
          <InlineFormField htmlFor="edit-display-name" label="Display Name">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-display-name"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              required
            />
          </InlineFormField>
          <InlineFormField htmlFor="edit-email" label="Email">
            <input
              type="email"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </InlineFormField>
          <InlineFormField htmlFor="edit-is-admin" label="Administrator">
            <div className="form-check form-switch mb-0">
              <input
                type="checkbox"
                className="form-check-input"
                role="switch"
                id="edit-is-admin"
                checked={editIsAdmin}
                onChange={(e) => setEditIsAdmin(e.target.checked)}
              />
            </div>
          </InlineFormField>
        </div>
      </form>
    </>
  );
}
