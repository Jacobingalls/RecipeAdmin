import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { settingsUpdateProfile } from '../../api';
import { Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSection() {
  const { t } = useTranslation();
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
      console.error("Couldn't update profile", err);
      setError(t('profile.error'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <h2 className="h4 mb-3">{t('profile.title')}</h2>

      {saved && (
        <div className="alert alert-success py-2 small" role="status">
          {t('profile.updated')}
        </div>
      )}

      <div className="card mb-5">
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-4 text-body-secondary">{t('profile.username')}</dt>
            <dd className="col-sm-8">{user?.username}</dd>
            <dt className="col-sm-4 text-body-secondary">{t('profile.displayName')}</dt>
            <dd className="col-sm-8">
              {editing ? (
                <form className="d-flex gap-2" onSubmit={handleSave}>
                  {error && (
                    <div className="alert alert-danger py-1 small w-100 mb-2" role="alert">
                      {error}
                    </div>
                  )}
                  <label htmlFor="edit-display-name" className="visually-hidden">
                    {t('profile.displayNameLabel')}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="edit-display-name"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                    {t('common.save')}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => setEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                </form>
              ) : (
                <span className="d-flex align-items-center gap-2">
                  {user?.displayName}
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-body-secondary d-inline-flex align-items-center justify-content-center"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    aria-label={t('profile.editDisplayName')}
                    onClick={startEditing}
                  >
                    <i className="bi bi-pencil" aria-hidden="true" />
                  </button>
                </span>
              )}
            </dd>
            <dt className="col-sm-4 text-body-secondary">{t('profile.email')}</dt>
            <dd className="col-sm-8 mb-0">{user?.email}</dd>
          </dl>
        </div>
      </div>
    </>
  );
}
