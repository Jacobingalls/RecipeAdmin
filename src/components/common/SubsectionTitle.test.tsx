import { render, screen } from '@testing-library/react';

import SubsectionTitle from './SubsectionTitle';

describe('SubsectionTitle', () => {
  it('renders an h2 with h6 styling by default', () => {
    render(<SubsectionTitle>Barcodes</SubsectionTitle>);
    const heading = screen.getByRole('heading', { name: 'Barcodes' });
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass('h6', 'mb-2');
    expect(heading).toHaveStyle({ opacity: '0.9' });
  });

  it('does not apply text-secondary or text-body-secondary', () => {
    render(<SubsectionTitle>Title</SubsectionTitle>);
    const heading = screen.getByRole('heading', { name: 'Title' });
    expect(heading).not.toHaveClass('text-secondary');
    expect(heading).not.toHaveClass('text-body-secondary');
  });

  it('renders a different heading level via as prop', () => {
    render(<SubsectionTitle as="h5">Today</SubsectionTitle>);
    const heading = screen.getByRole('heading', { name: 'Today' });
    expect(heading.tagName).toBe('H5');
    expect(heading).not.toHaveClass('h6');
  });

  it('supports custom className overriding the default', () => {
    render(<SubsectionTitle className="mb-0">Day</SubsectionTitle>);
    const heading = screen.getByRole('heading', { name: 'Day' });
    expect(heading).toHaveClass('mb-0');
    expect(heading).not.toHaveClass('mb-2');
  });

  it('renders children', () => {
    render(<SubsectionTitle>Custom Sizes</SubsectionTitle>);
    expect(screen.getByText('Custom Sizes')).toBeInTheDocument();
  });
});
