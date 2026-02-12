import type { SessionInfo } from '../../api';
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
  return (
    <>
      <SectionHeader title="Sessions" className="mt-4">
        <div className="btn-group">
          <button type="button" className="btn btn-dark btn-sm" onClick={onLogout}>
            Sign out
          </button>
          <button
            type="button"
            className="btn btn-dark btn-sm dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="visually-hidden">More sign out options</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item text-danger"
                type="button"
                onClick={onRevokeSessions}
                disabled={isRevokingSessions}
              >
                {isRevokingSessions ? 'Revoking...' : 'Sign out everywhere'}
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
                    Created {formatRelativeTime(session.sessionCreatedAt)}
                    {session.lastRefreshedAt && (
                      <> &middot; Last active {formatRelativeTime(session.lastRefreshedAt)}</>
                    )}
                    <> &middot; Expires {formatRelativeTime(session.expiresAt)}</>
                  </small>
                </>
              }
            >
              <DeleteButton
                ariaLabel={`Revoke session ${session.deviceName}`}
                onClick={() => onRevokeSession(session.familyID)}
              />
            </ListRow>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No active sessions.</p>
      )}
    </>
  );
}
