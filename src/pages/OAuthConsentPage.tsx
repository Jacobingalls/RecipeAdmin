import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ApiError, oauthDescribeAuthorization } from '../api';
import { ContentUnavailableView, LoadingState } from '../components/common';
import { OAuthConsentActions, OAuthConsentSummary } from '../components/oauth';
import { useAuth } from '../contexts/AuthContext';
import { useApiQuery } from '../hooks';

export default function OAuthConsentPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const request = searchParams.get('request');

  const { data, loading, error } = useApiQuery(
    async () => {
      try {
        return await oauthDescribeAuthorization(request ?? '');
      } catch (err) {
        const reason = err instanceof ApiError ? err.reason : null;
        throw new Error(reason ?? t('oauthConsent.loadError.description'));
      }
    },
    [request],
    { enabled: !!request },
  );

  if (!request) {
    return (
      <div role="alert">
        <ContentUnavailableView
          icon="bi-link-45deg"
          title={t('oauthConsent.missingRequest.title')}
          description={t('oauthConsent.missingRequest.description')}
        />
      </div>
    );
  }
  if (loading) return <LoadingState />;
  if (error || !data) {
    return (
      <div role="alert">
        <ContentUnavailableView
          icon="bi-shield-exclamation"
          title={t('oauthConsent.loadError.title')}
          description={error ?? undefined}
        />
      </div>
    );
  }

  return (
    <section className="card">
      <div className="card-body p-4">
        <OAuthConsentSummary description={data} user={user} />
        <OAuthConsentActions request={request} />
      </div>
    </section>
  );
}
