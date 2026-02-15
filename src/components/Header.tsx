import { NavLink } from 'react-router-dom';

import { getAdminVersion } from '../api';
import { useAuth } from '../contexts/AuthContext';

import { HeaderSearchBar, UserDropdownMenu } from './header/index';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const adminVersion = getAdminVersion();

  if (!isAuthenticated) return null;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link px-3 py-2 rounded ${isActive ? 'active text-white fw-semibold' : 'text-light'}`;

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
          <ul className="navbar-nav me-auto mb-2 mb-sm-0 gap-1">
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
          <HeaderSearchBar />
          <UserDropdownMenu />
        </div>
      </div>
    </nav>
  );
}
