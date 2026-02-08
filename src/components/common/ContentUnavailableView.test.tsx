import { render, screen } from '@testing-library/react';

import ContentUnavailableView from './ContentUnavailableView';

describe('ContentUnavailableView', () => {
  it('renders the icon with correct classes', () => {
    const { container } = render(<ContentUnavailableView icon="bi-box-seam" title="No Products" />);
    const icon = container.querySelector('i');
    expect(icon).toHaveClass('bi', 'bi-box-seam', 'fs-1', 'text-secondary');
  });

  it('renders the title', () => {
    render(<ContentUnavailableView icon="bi-box-seam" title="No Products" />);
    expect(screen.getByText('No Products')).toBeInTheDocument();
    expect(screen.getByText('No Products').tagName).toBe('H5');
  });

  it('renders the description when provided', () => {
    render(
      <ContentUnavailableView
        icon="bi-box-seam"
        title="No Products"
        description="Try adjusting your search"
      />,
    );
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
  });

  it('does not render a description paragraph when omitted', () => {
    const { container } = render(<ContentUnavailableView icon="bi-box-seam" title="No Products" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('centers content with vertical padding', () => {
    const { container } = render(<ContentUnavailableView icon="bi-box-seam" title="No Products" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('text-center');
    expect(wrapper.className).toContain('py-5');
  });
});
