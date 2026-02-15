import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { API_DISPLAY_URL } from '../../api';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatEnvironmentName(apiEnvironment: string | undefined): string {
  if (!apiEnvironment) return 'Unknown';
  if (apiEnvironment.toLowerCase() === 'debug') return 'Development';
  return apiEnvironment.charAt(0).toUpperCase() + apiEnvironment.slice(1);
}

function useGravatarUrl(email: string | undefined, size: number = 32): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    sha256Hex(email.trim().toLowerCase()).then((hash) => {
      if (!cancelled) {
        setUrl(`https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=mp`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [email, size]);

  return email ? url : null;
}

const menuIconStyle: CSSProperties = { width: 20, marginRight: 8 };

interface UserDropdownMenuProps {
  displayName: string | undefined;
  username: string | undefined;
  email: string | undefined;
  isAdmin: boolean;
  onLogout: () => void;
  adminVersion: string | null;
  adminGitCommit: string | null;
  adminEnvironment: string | null;
  apiVersion: string | null | undefined;
  apiGitCommit: string | null | undefined;
  apiEnvironment: string | null | undefined;
}

export default function UserDropdownMenu({
  displayName,
  username,
  email,
  isAdmin,
  onLogout,
  adminVersion,
  adminGitCommit,
  adminEnvironment,
  apiVersion,
  apiGitCommit,
  apiEnvironment,
}: UserDropdownMenuProps) {
  const avatarUrl = useGravatarUrl(email);

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn p-0 border-0 rounded-circle"
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
            <Link className="dropdown-item d-flex align-items-center" to="/admin/users">
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
            onClick={onLogout}
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
              {adminEnvironment
                ? adminEnvironment.charAt(0).toUpperCase() + adminEnvironment.slice(1)
                : 'Development'}
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
