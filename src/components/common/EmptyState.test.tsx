import { render, screen } from '@testing-library/react';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<EmptyState message="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('applies secondary text style', () => {
    const { container } = render(<EmptyState />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('text-secondary');
  });
});
