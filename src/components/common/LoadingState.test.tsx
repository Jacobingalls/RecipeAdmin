import { render, screen } from '@testing-library/react';

import LoadingState from './LoadingState';

describe('LoadingState', () => {
  it('renders the spinner with status role', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('spinner-border', 'text-secondary');
  });

  it('renders the default title', () => {
    render(<LoadingState />);
    const heading = screen.getByText('Loading...', { selector: 'h5' });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H5');
  });

  it('renders a custom title', () => {
    render(<LoadingState title="Please wait" />);
    expect(screen.getByText('Please wait', { selector: 'h5' })).toBeInTheDocument();
  });

  it('includes the title as visually-hidden text for accessibility', () => {
    render(<LoadingState title="Fetching data" />);
    const hiddenText = screen.getByText('Fetching data', { selector: '.visually-hidden' });
    expect(hiddenText).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<LoadingState title="Loading" description="This may take a moment" />);
    expect(screen.getByText('This may take a moment')).toBeInTheDocument();
  });

  it('does not render a description paragraph when omitted', () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('centers content with vertical padding', () => {
    const { container } = render(<LoadingState />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('text-center');
    expect(wrapper.className).toContain('py-5');
  });
});
