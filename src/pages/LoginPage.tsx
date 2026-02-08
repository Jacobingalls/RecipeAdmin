import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login, loginWithPasskey } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
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
      setError(err instanceof Error ? err.message : 'Passkey login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAPIKeyLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <h4 className="mb-4 text-center">Sign in to Recipe Admin</h4>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card mb-3">
          <div className="card-body text-center">
            <h6 className="card-title mb-3">Sign in with Passkey</h6>
            <p className="text-body-secondary small mb-3">
              Use your fingerprint, face, or security key
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePasskeyLogin}
              disabled={isSubmitting}
            >
              <i className="bi bi-fingerprint me-2" />
              Sign in with Passkey
            </button>
          </div>
        </div>

        <div className="text-center text-body-secondary my-3">
          <small>or</small>
        </div>

        <div className="card">
          <div className="card-body">
            <h6 className="card-title mb-3">Sign in with API Key</h6>
            <form onSubmit={handleAPIKeyLogin}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  API Key
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
              <button
                type="submit"
                className="btn btn-outline-primary w-100"
                disabled={isSubmitting}
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
