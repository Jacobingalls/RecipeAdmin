import { useState, useCallback } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

import { useAuth } from '../../contexts/AuthContext';
import { settingsAddPasskeyBegin, settingsAddPasskeyFinish } from '../../api';

import Button from './Button';

export default function PasskeySetupPrompt() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('passkey-prompt-dismissed') === 'true',
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetup = useCallback(async () => {
    setError(null);
    setIsRegistering(true);
    try {
      const { options, sessionID } = await settingsAddPasskeyBegin();
      const credential = await startRegistration({ optionsJSON: options });
      await settingsAddPasskeyFinish(sessionID, credential, navigator.platform || 'Passkey');
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong registering your passkey. Try again.',
      );
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem('passkey-prompt-dismissed', 'true');
    setDismissed(true);
  }, []);

  if (!user || user.hasPasskeys || dismissed || success) return null;

  return (
    <div className="alert alert-info d-flex align-items-start mb-4" role="alert">
      <i className="bi bi-shield-lock me-3 fs-4" />
      <div className="flex-grow-1">
        <h6 className="alert-heading mb-1">Secure your account with a passkey</h6>
        <p className="mb-2 small">
          Sign in faster and more securely with your fingerprint or face.
        </p>
        {error && <p className="text-danger small mb-2">{error}</p>}
        <div className="d-flex gap-2">
          <Button size="sm" onClick={handleSetup} loading={isRegistering}>
            Set up now
          </Button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDismiss}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
