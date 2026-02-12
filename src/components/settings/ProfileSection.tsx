import type { FormEvent } from 'react';
import { useState } from 'react';

import { settingsUpdateProfile } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSection() {
  const { user, updateUser, refreshSession } = useAuth();

  const [editing, setEditing] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function startEditing() {
    setDisplayNameInput(user?.displayName ?? '');
    setEditing(true);
    setError(null);
    setSaved(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const updated = await settingsUpdateProfile({ displayName: displayNameInput });
      updateUser(updated);
      await refreshSession();
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update your profile. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <h2 className="h4 mb-3">Profile</h2>

      {saved && (
        <div className="alert alert-success py-2 small" role="status">
          Display name updated.
        </div>
      )}

      <div className="card mb-5">
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-4 text-body-secondary">Username</dt>
            <dd className="col-sm-8">{user?.username}</dd>
            <dt className="col-sm-4 text-body-secondary">Display Name</dt>
            <dd className="col-sm-8">
              {editing ? (
                <form className="d-flex gap-2" onSubmit={handleSave}>
                  {error && (
                    <div className="alert alert-danger py-1 small w-100 mb-2" role="alert">
                      {error}
                    </div>
                  )}
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="edit-display-name"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span className="d-flex align-items-center gap-2">
                  {user?.displayName}
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-body-secondary"
                    aria-label="Edit display name"
                    onClick={startEditing}
                  >
                    <i className="bi bi-pencil" aria-hidden="true" />
                  </button>
                </span>
              )}
            </dd>
            <dt className="col-sm-4 text-body-secondary">Email</dt>
            <dd className="col-sm-8 mb-0">{user?.email}</dd>
          </dl>
        </div>
      </div>
    </>
  );
}
