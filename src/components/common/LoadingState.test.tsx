import { render, screen } from '@testing-library/react';

import LoadingState from './LoadingState';

describe('LoadingState', () => {
  it('renders default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingState message="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('applies italic and secondary styles', () => {
    const { container } = render(<LoadingState />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('text-secondary');
    expect(div.className).toContain('fst-italic');
  });
});
