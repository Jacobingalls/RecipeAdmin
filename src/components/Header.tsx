import type { FormEvent } from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import VersionBadge from './VersionBadge';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const [barcode, setBarcode] = useState('');
  const navigate = useNavigate();

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
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
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
          <form className="d-flex" role="search" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control form-control-sm me-2"
              placeholder="Barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              style={{ width: 150 }}
            />
            <button type="submit" className="btn btn-outline-light btn-sm">
              Lookup
            </button>
          </form>
          <button
            type="button"
            className="btn btn-outline-light btn-sm ms-2"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M3.757 4.464a.5.5 0 0 1-.707 0L1.636 3.05a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
