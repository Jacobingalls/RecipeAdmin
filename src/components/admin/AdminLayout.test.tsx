import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import AdminLayout from './AdminLayout';

vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

function renderWithRoute(route = '/admin/users') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="admin/users" element={<div data-testid="outlet-content">Users Page</div>} />
          <Route
            path="admin/products"
            element={<div data-testid="outlet-content">Products Page</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminLayout', () => {
  it('renders the header', () => {
    renderWithRoute();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the admin sidebar', () => {
    renderWithRoute();
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument();
  });

  it('renders the outlet content', () => {
    renderWithRoute();
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('Users Page');
  });

  it('renders a main element wrapping the outlet', () => {
    renderWithRoute();
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId('outlet-content'));
  });

  it('renders sidebar nav links for Products, Groups, and Users', () => {
    renderWithRoute();
    expect(screen.getByRole('link', { name: /Products/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Groups/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/ })).toBeInTheDocument();
  });

  it('renders outlet for different routes', () => {
    renderWithRoute('/admin/products');
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('Products Page');
  });
});
