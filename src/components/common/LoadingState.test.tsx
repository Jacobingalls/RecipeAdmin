import { render, screen } from '@testing-library/react';

import LoadingState from './LoadingState';

describe('LoadingState', () => {
  it('renders the spinner', () => {
    const { container } = render(<LoadingState />);
    const spinner = container.querySelector('.spinner-border');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border', 'text-secondary');
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

  it('renders the title visibly', () => {
    render(<LoadingState title="Fetching data" />);
    expect(screen.getByText('Fetching data', { selector: 'h5' })).toBeInTheDocument();
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
    expect(wrapper.className).toContain('align-items-center');
    expect(wrapper.className).toContain('py-5');
  });
});
