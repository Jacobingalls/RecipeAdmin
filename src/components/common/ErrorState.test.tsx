import { render, screen } from '@testing-library/react';

import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders error message with prefix', () => {
    render(<ErrorState message="Something failed" />);
    expect(screen.getByText('Error: Something failed')).toBeInTheDocument();
  });

  it('applies danger text style', () => {
    const { container } = render(<ErrorState message="fail" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('text-danger');
  });
});
