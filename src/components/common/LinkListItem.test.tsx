import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LinkListItem from './LinkListItem';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LinkListItem', () => {
  it('renders as a link with correct href', () => {
    renderWithRouter(<LinkListItem to="/products/1" title="Oats" />);
    const link = screen.getByRole('link', { name: /Oats/ });
    expect(link).toHaveAttribute('href', '/products/1');
  });

  it('renders title in bold', () => {
    renderWithRouter(<LinkListItem to="/products/1" title="Oats" />);
    const titleEl = screen.getByText('Oats');
    expect(titleEl.closest('.fw-bold')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderWithRouter(<LinkListItem to="/products/1" title="Oats" subtitle="Quaker" />);
    expect(screen.getByText('Quaker')).toBeInTheDocument();
  });

  it('does not render subtitle element when not provided', () => {
    const { container } = renderWithRouter(<LinkListItem to="/products/1" title="Oats" />);
    expect(container.querySelector('small')).toBeNull();
  });

  it('applies list-group-item classes', () => {
    renderWithRouter(<LinkListItem to="/products/1" title="Oats" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('list-group-item', 'list-group-item-action');
  });

  it('uses flex layout when trailing is provided', () => {
    renderWithRouter(
      <LinkListItem
        to="/admin/users/1"
        title={<strong>Alice</strong>}
        trailing={<span>2 keys</span>}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('d-flex', 'align-items-center');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('2 keys')).toBeInTheDocument();
  });

  it('always uses flex layout for icon alignment', () => {
    renderWithRouter(<LinkListItem to="/products/1" title="Oats" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('d-flex', 'align-items-center');
  });

  it('renders icon when provided', () => {
    const { container } = renderWithRouter(
      <LinkListItem to="/products/1" title="Oats" icon="bi-person" />,
    );
    const icon = container.querySelector('i.bi.bi-person');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render icon when not provided', () => {
    const { container } = renderWithRouter(<LinkListItem to="/products/1" title="Oats" />);
    expect(container.querySelector('i.bi')).toBeNull();
  });

  it('renders trailing content alongside title', () => {
    renderWithRouter(
      <LinkListItem
        to="/admin/users/1"
        title={<strong>Bob</strong>}
        subtitle="bob123"
        trailing={<span>Admin</span>}
      />,
    );
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob123')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders ReactNode title correctly', () => {
    renderWithRouter(
      <LinkListItem
        to="/test"
        title={
          <>
            <strong>Display</strong>
            <small>username</small>
          </>
        }
      />,
    );
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
  });
});
