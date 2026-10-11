import { useTranslation } from 'react-i18next';

import type { AuthUser, OAuthAuthorizationDescription } from '../../api';
import { describeOAuthRedirect } from '../../utils';

interface OAuthConsentSummaryProps {
  description: OAuthAuthorizationDescription;
  user: AuthUser | null;
}

export default function OAuthConsentSummary({ description, user }: OAuthConsentSummaryProps) {
  const { t } = useTranslation();
  const redirect = describeOAuthRedirect(description.redirectURI);

  return (
    <>
      <header className="text-center mb-4">
        <h1 className="h3 fw-bold mb-1 text-break">{description.clientName}</h1>
        <p className="text-body-secondary mb-0">{t('oauthConsent.subtitle')}</p>
      </header>

      <dl className="row mb-3">
        <dt className="col-sm-4">{t('oauthConsent.account')}</dt>
        <dd className="col-sm-8 text-break">
          {user?.displayName || user?.username}
          {user?.displayName && <span className="text-body-secondary ms-2">{user.username}</span>}
        </dd>
        <dt className="col-sm-4">{t('oauthConsent.clientId')}</dt>
        <dd className="col-sm-8">
          <code className="text-break">{description.clientID}</code>
        </dd>
        <dt className="col-sm-4">{t('oauthConsent.returnsTo')}</dt>
        <dd className="col-sm-8 text-break">{redirect.host}</dd>
      </dl>

      {!redirect.isFamiliar && (
        <div className="alert alert-warning d-flex" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true" />
          <div>{t('oauthConsent.redirectWarning', { host: redirect.host })}</div>
        </div>
      )}

      {description.scopes.length > 0 && (
        <section aria-labelledby="oauth-consent-scopes">
          <h2 id="oauth-consent-scopes" className="h6">
            {t('oauthConsent.scopes')}
          </h2>
          <ul className="list-group mb-3">
            {description.scopes.map((scope) => (
              <li key={scope.name} className="list-group-item">
                <div>{scope.description}</div>
                <code className="small">{scope.name}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
