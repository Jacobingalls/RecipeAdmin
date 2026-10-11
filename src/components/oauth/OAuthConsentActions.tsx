import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { oauthDecideAuthorization } from '../../api';
import { Button } from '../common';

interface OAuthConsentActionsProps {
  /** The `request` query parameter from the consent URL. */
  request: string;
}

type Decision = 'allow' | 'deny';

/** Buttons stay disabled after a decision succeeds because the browser is navigating away. */
export default function OAuthConsentActions({ request }: OAuthConsentActionsProps) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: Decision) {
    setError(null);
    setPending(decision);
    try {
      const { redirectTo } = await oauthDecideAuthorization(request, decision === 'allow');
      window.location.assign(redirectTo);
    } catch {
      setError(t('oauthConsent.decisionError'));
      setPending(null);
    }
  }

  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="d-flex flex-column flex-sm-row-reverse gap-2">
        <Button
          variant="primary"
          className="flex-sm-fill"
          onClick={() => decide('allow')}
          loading={pending === 'allow'}
          disabled={pending !== null}
        >
          {t('oauthConsent.allow')}
        </Button>
        <Button
          variant="outline-secondary"
          className="flex-sm-fill"
          onClick={() => decide('deny')}
          loading={pending === 'deny'}
          disabled={pending !== null}
        >
          {t('oauthConsent.deny')}
        </Button>
      </div>
    </>
  );
}
