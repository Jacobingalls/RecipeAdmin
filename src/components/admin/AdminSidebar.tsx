import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <nav className="flex-shrink-0 pt-4" style={{ width: '13.75rem' }} aria-label="Admin">
      <h6 className="text-body-secondary text-uppercase fw-semibold small mb-2 px-3">Admin</h6>
      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `nav-link rounded-2 py-2 ${isActive ? 'bg-body-secondary fw-semibold text-body' : 'text-body-secondary'}`
            }
          >
            <i className="bi bi-box-seam me-2" aria-hidden="true" />
            Products
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/admin/groups"
            className={({ isActive }) =>
              `nav-link rounded-2 py-2 ${isActive ? 'bg-body-secondary fw-semibold text-body' : 'text-body-secondary'}`
            }
          >
            <i className="bi bi-collection me-2" aria-hidden="true" />
            Groups
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `nav-link rounded-2 py-2 ${isActive ? 'bg-body-secondary fw-semibold text-body' : 'text-body-secondary'}`
            }
          >
            <i className="bi bi-people me-2" aria-hidden="true" />
            Users
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
