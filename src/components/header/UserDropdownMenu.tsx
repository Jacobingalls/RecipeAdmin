import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import {
  API_DISPLAY_URL,
  getAdminEnvironment,
  getAdminGitCommit,
  getAdminVersion,
} from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useGravatarUrl } from '../../hooks/useGravatarUrl';
import { formatEnvironmentName } from '../../utils';

const menuIconStyle: CSSProperties = { width: 20, marginRight: 8 };

export default function UserDropdownMenu() {
  const { user, logout, apiVersion, apiGitCommit, apiEnvironment } = useAuth();
  const avatarUrl = useGravatarUrl(user?.email);

  const adminVersion = getAdminVersion();
  const adminGitCommit = getAdminGitCommit();
  const adminEnvironment = getAdminEnvironment();

  const displayName = user?.displayName;
  const username = user?.username;
  const isAdmin = user?.isAdmin ?? false;

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn p-1 border-0 rounded-circle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="rounded-circle"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold"
            style={{ width: 32, height: 32, fontSize: 14 }}
          >
            {(displayName?.[0] ?? username?.[0] ?? '?').toUpperCase()}
          </span>
        )}
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end"
        style={{ minWidth: '14rem' }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('a, button')) {
            e.stopPropagation();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (!(e.target as HTMLElement).closest('a, button')) {
              e.stopPropagation();
            }
          }
        }}
        role="menu"
      >
        <li className="px-3 py-2">
          <div className="fw-semibold">{displayName}</div>
          <div className="text-body-secondary small">{username}</div>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <Link className="dropdown-item d-flex align-items-center" to="/settings">
            <i
              className="bi bi-gear d-inline-block text-center"
              aria-hidden="true"
              style={menuIconStyle}
            />
            Settings
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link className="dropdown-item d-flex align-items-center" to="/admin">
              <i
                className="bi bi-shield-lock d-inline-block text-center"
                aria-hidden="true"
                style={menuIconStyle}
              />
              Admin
            </Link>
          </li>
        )}
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <button
            type="button"
            className="dropdown-item d-flex align-items-center"
            onClick={logout}
          >
            <i
              className="bi bi-box-arrow-right d-inline-block text-center"
              aria-hidden="true"
              style={menuIconStyle}
            />
            Sign out
          </button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="px-3 py-1">
          <div className="d-flex align-items-start text-body-secondary small">
            <i
              className="bi bi-window d-inline-block text-center flex-shrink-0"
              aria-hidden="true"
              style={{ ...menuIconStyle, lineHeight: 'inherit' }}
            />
            <span>
              {formatEnvironmentName(adminEnvironment ?? 'development')}
              {adminVersion && (
                <>
                  <br />
                  <span className="text-body-tertiary">
                    {adminVersion}
                    {adminGitCommit && ` (${adminGitCommit})`}
                  </span>
                </>
              )}
            </span>
          </div>
        </li>
        <li className="px-3 py-1">
          <div className="d-flex align-items-start text-body-secondary small">
            <i
              className="bi bi-hdd-network d-inline-block text-center flex-shrink-0"
              aria-hidden="true"
              style={{ ...menuIconStyle, lineHeight: 'inherit' }}
            />
            <span>
              {formatEnvironmentName(apiEnvironment ?? undefined)}
              {apiVersion && (
                <>
                  <br />
                  <span className="text-body-tertiary">
                    {apiVersion}
                    {apiGitCommit && ` (${apiGitCommit})`}
                  </span>
                </>
              )}
              <br />
              <a
                href={API_DISPLAY_URL}
                className="text-body-tertiary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {API_DISPLAY_URL}
              </a>
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
