import type { FormEvent } from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import VersionBadge from './VersionBadge';

export default function Header() {
  const { isAuthenticated, user } = useAuth();
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
                {user?.isAdmin && (
                  <li className="nav-item">
                    <NavLink className={navLinkClass} to="/admin/users">
                      Admin
                    </NavLink>
                  </li>
                )}
              </ul>
              <form className="d-flex" role="search" onSubmit={handleSearch}>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
