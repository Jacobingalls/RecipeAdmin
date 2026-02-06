import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import BackButton from './BackButton';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('BackButton', () => {
  it('renders with default label', () => {
    renderWithRouter(<BackButton to="/home" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Back');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders with custom label', () => {
    renderWithRouter(<BackButton to="/products" label="Products" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Products');
  });

  it('applies button styling classes', () => {
    renderWithRouter(<BackButton to="/" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('btn');
    expect(link.className).toContain('btn-outline-secondary');
    expect(link.className).toContain('btn-sm');
  });
});
