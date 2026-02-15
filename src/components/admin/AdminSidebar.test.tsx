import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AdminSidebar from './AdminSidebar';

function renderWithRoute(route = '/admin/users') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AdminSidebar />
    </MemoryRouter>,
  );
}

describe('AdminSidebar', () => {
  it('renders a nav element with Admin aria-label', () => {
    renderWithRoute();
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument();
  });

  it('renders the Admin heading', () => {
    renderWithRoute();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders Products link pointing to /admin/products', () => {
    renderWithRoute();
    const link = screen.getByRole('link', { name: /Products/ });
    expect(link).toHaveAttribute('href', '/admin/products');
  });

  it('renders Groups link pointing to /admin/groups', () => {
    renderWithRoute();
    const link = screen.getByRole('link', { name: /Groups/ });
    expect(link).toHaveAttribute('href', '/admin/groups');
  });

  it('renders Users link pointing to /admin/users', () => {
    renderWithRoute();
    const link = screen.getByRole('link', { name: /Users/ });
    expect(link).toHaveAttribute('href', '/admin/users');
  });

  it('applies active styling to the current route link', () => {
    renderWithRoute('/admin/users');
    const usersLink = screen.getByRole('link', { name: /Users/ });
    expect(usersLink.className).toContain('bg-body-secondary');
    expect(usersLink.className).toContain('fw-semibold');
  });

  it('applies inactive styling to non-current route links', () => {
    renderWithRoute('/admin/users');
    const productsLink = screen.getByRole('link', { name: /Products/ });
    expect(productsLink.className).toContain('text-body-secondary');
    expect(productsLink.className).not.toContain('bg-body-secondary');
  });

  it('highlights Products link when on products route', () => {
    renderWithRoute('/admin/products');
    const productsLink = screen.getByRole('link', { name: /Products/ });
    expect(productsLink.className).toContain('bg-body-secondary');
    expect(productsLink.className).toContain('fw-semibold');

    const usersLink = screen.getByRole('link', { name: /Users/ });
    expect(usersLink.className).not.toContain('bg-body-secondary');
  });

  it('highlights Groups link when on groups route', () => {
    renderWithRoute('/admin/groups');
    const groupsLink = screen.getByRole('link', { name: /Groups/ });
    expect(groupsLink.className).toContain('bg-body-secondary');
    expect(groupsLink.className).toContain('fw-semibold');
  });

  it('renders icons with aria-hidden for accessibility', () => {
    const { container } = renderWithRoute();
    const icons = container.querySelectorAll('[aria-hidden="true"]');
    expect(icons).toHaveLength(3);
    expect(container.querySelector('.bi-box-seam')).toBeInTheDocument();
    expect(container.querySelector('.bi-collection')).toBeInTheDocument();
    expect(container.querySelector('.bi-people')).toBeInTheDocument();
  });

  it('renders all links within list items', () => {
    renderWithRoute();
    const list = screen.getByRole('list');
    const items = list.querySelectorAll('li');
    expect(items).toHaveLength(3);
  });
});
