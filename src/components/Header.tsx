import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import VersionBadge from './VersionBadge';

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

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [barcode, setBarcode] = useState('');
  const navigate = useNavigate();
  const avatarUrl = useGravatarUrl(user?.email);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link px-3 py-2 rounded ${isActive ? 'active bg-primary' : 'text-light'}`;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (barcode.trim()) {
      navigate(`/lookup/${encodeURIComponent(barcode.trim())}`);
      setBarcode('');
    }
  }

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <div className="d-flex flex-column">
          <NavLink className="navbar-brand fw-semibold mb-0 fs-6" to="/">
            Recipe Admin
          </NavLink>
          <VersionBadge />
        </div>
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
          {isAuthenticated && (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/" end>
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/products">
                    Products
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/groups">
                    Groups
                  </NavLink>
                </li>
              </ul>
              <form className="d-flex me-3" role="search" onSubmit={handleSearch}>
                <label htmlFor="barcode-search" className="visually-hidden">
                  Barcode
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">
                    <i className="bi bi-upc-scan" aria-hidden="true" />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    id="barcode-search"
                    placeholder="Barcode..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    style={{ width: 150 }}
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
                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="px-3 py-2">
                    <div className="fw-semibold">{user?.displayName}</div>
                    <div className="text-body-secondary small">{user?.username}</div>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      <i className="bi bi-gear me-2" aria-hidden="true" />
                      Settings
                    </Link>
                  </li>
                  {user?.isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/admin/users">
                        <i className="bi bi-shield-lock me-2" aria-hidden="true" />
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button type="button" className="dropdown-item" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
