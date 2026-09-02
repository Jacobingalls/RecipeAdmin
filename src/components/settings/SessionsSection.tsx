import type { SessionInfo } from '../../api';
import { useTranslation } from '../../contexts/LocaleContext';
import { ListRow, DeleteButton, SectionHeader } from '../common';
import { formatRelativeTime } from '../../utils';

interface SessionsSectionProps {
  sessions: SessionInfo[] | null;
  isRevokingSessions: boolean;
  onLogout: () => void;
  onRevokeSessions: () => void;
  onRevokeSession: (familyId: string) => void;
}

export default function SessionsSection({
  sessions,
  isRevokingSessions,
  onLogout,
  onRevokeSessions,
  onRevokeSession,
}: SessionsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <SectionHeader title={t('sessions.title')} className="mt-4">
        <div className="btn-group">
          <button type="button" className="btn btn-dark btn-sm" onClick={onLogout}>
            {t('sessions.signOut')}
          </button>
          <button
            type="button"
            className="btn btn-dark btn-sm dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="visually-hidden">{t('sessions.moreOptions')}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item text-danger"
                type="button"
                onClick={onRevokeSessions}
                disabled={isRevokingSessions}
              >
                {t('sessions.signOutEverywhere')}
              </button>
            </li>
          </ul>
        </div>
      </SectionHeader>
      {sessions && sessions.length > 0 ? (
        <div className="list-group mb-3">
          {sessions.map((session) => (
            <ListRow
              key={session.familyID}
              icon="bi-display"
              content={
                <>
                  <strong>{session.deviceName}</strong>
                  <br />
                  <small className="text-body-secondary">
                    {t('sessions.created', { time: formatRelativeTime(session.sessionCreatedAt) })}
                    {session.lastRefreshedAt && (
                      <>
                        {' '}
                        &middot;{' '}
                        {t('sessions.lastActive', {
                          time: formatRelativeTime(session.lastRefreshedAt),
                        })}
                      </>
                    )}
                    <>
                      {' '}
                      &middot;{' '}
                      {t('sessions.expires', { time: formatRelativeTime(session.expiresAt) })}
                    </>
                  </small>
                </>
              }
            >
              <DeleteButton
                ariaLabel={t('sessions.revoke', { name: session.deviceName })}
                onClick={() => onRevokeSession(session.familyID)}
              />
            </ListRow>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">{t('sessions.empty')}</p>
      )}
    </>
  );
}
