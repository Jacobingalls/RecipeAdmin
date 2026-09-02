import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Button } from '../components/common';
import VersionBadge from '../components/VersionBadge';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LocaleContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, login, loginWithPasskey } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-vh-100 bg-body-tertiary d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common.loadingEllipsis')}</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handlePasskeyLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPasskey();
    } catch (err) {
      console.error("Couldn't sign in with passkey", err);
      setError(t('login.error.passkey'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAPIKeyLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(usernameOrEmail, password);
    } catch (err) {
      console.error("Couldn't sign in", err);
      setError(t('login.error.credentials'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-vh-100 bg-body-tertiary d-flex align-items-center justify-content-center">
      <div className="text-center" style={{ width: '100%', maxWidth: 360, padding: '0 1rem' }}>
        <h1 className="display-5 fw-bold mb-1">Recipe Admin</h1>
        <div className="mb-4">
          <VersionBadge />
        </div>

        {error && (
          <div className="alert alert-danger text-start" role="alert">
            {error}
          </div>
        )}

        {!showApiKeyForm ? (
          <>
            <Button
              variant="primary"
              size="lg"
              className="w-100 mb-3"
              onClick={handlePasskeyLogin}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <i className="bi bi-fingerprint me-2" />
              {t('login.signInWithPasskey')}
            </Button>
            <button
              type="button"
              className="btn btn-link text-body-secondary text-decoration-none"
              onClick={() => setShowApiKeyForm(true)}
            >
              {t('login.signInWithApiKey')}
            </button>
          </>
        ) : (
          <>
            <form className="text-start mb-3" onSubmit={handleAPIKeyLogin}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  {t('login.usernameOrEmail')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  {t('login.apiKey')}
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                variant="primary"
                type="submit"
                className="w-100"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('login.submit')}
              </Button>
            </form>
            <button
              type="button"
              className="btn btn-link text-body-secondary text-decoration-none"
              onClick={() => {
                setShowApiKeyForm(false);
                handlePasskeyLogin();
              }}
            >
              <i className="bi bi-fingerprint me-2" />
              {t('login.signInWithPasskey')}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
