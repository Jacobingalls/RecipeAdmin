import type { CSSProperties, FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import { API_DISPLAY_URL, getAdminGitCommit, getAdminVersion } from '../api';
import { useAuth } from '../contexts/AuthContext';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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

export default function Header() {
  const { isAuthenticated, user, logout, apiVersion, apiEnvironment } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlQuery = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const navigate = useNavigate();
  const avatarUrl = useGravatarUrl(user?.email);
  const adminVersion = getAdminVersion();
  const adminGitCommit = getAdminGitCommit();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync local input with URL when the q param changes (e.g. back/forward navigation)
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const isOnSearchPage = location.pathname === '/search';

  const navigateToSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      const path = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
      navigate(path, { replace: isOnSearchPage });
    },
    [navigate, isOnSearchPage],
  );

  // Auto-search after debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    // Skip if the URL already matches
    if (trimmed === urlQuery) return;
    // Require minimum length for non-empty queries
    if (trimmed.length > 0 && trimmed.length < 2) return;
    // Only navigate to empty search if already on the search page
    if (trimmed.length === 0 && !isOnSearchPage) return;

    debounceRef.current = setTimeout(() => navigateToSearch(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, urlQuery, isOnSearchPage, navigateToSearch]);

  if (!isAuthenticated) return null;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link px-3 py-2 rounded ${isActive ? 'active text-white fw-semibold' : 'text-light'}`;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigateToSearch(searchQuery);
  }

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <NavLink
          className="navbar-brand mb-0 user-select-none d-flex align-items-center position-relative"
          to="/"
          aria-label="Recipe Admin home"
        >
          <i
            className="bi bi-egg-fried text-warning"
            aria-hidden="true"
            style={{ fontSize: '1.4rem' }}
          />
          {!adminVersion && (
            <span
              className="position-absolute badge bg-danger rounded-pill"
              style={{ fontSize: '0.45rem', bottom: 4, right: -12, lineHeight: 1 }}
            >
              DEV
            </span>
          )}
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/" end>
                <span className="d-inline-flex flex-column align-items-center">
                  Home
                  <span className="fw-semibold invisible" style={{ height: 0 }} aria-hidden="true">
                    Home
                  </span>
                </span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/favorites">
                <span className="d-inline-flex flex-column align-items-center">
                  Favorites
                  <span className="fw-semibold invisible" style={{ height: 0 }} aria-hidden="true">
                    Favorites
                  </span>
                </span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/history">
                <span className="d-inline-flex flex-column align-items-center">
                  History
                  <span className="fw-semibold invisible" style={{ height: 0 }} aria-hidden="true">
                    History
                  </span>
                </span>
              </NavLink>
            </li>
          </ul>
          <form className="d-flex me-3" role="search" onSubmit={handleSearch}>
            <label htmlFor="header-search" className="visually-hidden">
              Search
            </label>
            <div
              className="input-group rounded-pill overflow-hidden"
              style={{ border: '2px solid transparent' }}
            >
              <span className="input-group-text border-0 bg-body-secondary pe-0">
                <i className="bi bi-search" aria-hidden="true" />
              </span>
              <input
                type="search"
                className="form-control border-0 bg-body-secondary shadow-none ps-2"
                id="header-search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => {
                  const group = e.currentTarget.closest('.input-group') as HTMLElement | null;
                  group?.style.setProperty('border-color', 'var(--bs-primary)');
                }}
                onBlur={(e) => {
                  const group = e.currentTarget.closest('.input-group') as HTMLElement | null;
                  group?.style.setProperty('border-color', 'transparent');
                }}
              />
            </div>
          </form>
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
                  {(user?.displayName?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}
                </span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '14rem' }}>
              <li className="px-3 py-2">
                <div className="fw-semibold">{user?.displayName}</div>
                <div className="text-body-secondary small">{user?.username}</div>
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
              {user?.isAdmin && (
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
                <div className="d-flex align-items-center text-body-secondary small">
                  <i
                    className="bi bi-window d-inline-block text-center flex-shrink-0"
                    aria-hidden="true"
                    style={menuIconStyle}
                  />
                  <span>
                    {adminVersion ? `v${adminVersion}` : 'Development'}
                    {adminGitCommit && (
                      <span className="text-body-tertiary ms-1">({adminGitCommit})</span>
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
                    {apiEnvironment &&
                      (apiEnvironment.toLowerCase() === 'debug'
                        ? 'Development'
                        : apiEnvironment.charAt(0).toUpperCase() + apiEnvironment.slice(1))}
                    {apiVersion && (
                      <>
                        {apiEnvironment && <br />}v{apiVersion}
                      </>
                    )}
                    {apiEnvironment?.toLowerCase() === 'debug' && (
                      <>
                        <br />
                        <span className="text-body-tertiary">{API_DISPLAY_URL}</span>
                      </>
                    )}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
