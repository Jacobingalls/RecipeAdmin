import { render, screen } from '@testing-library/react';

import SectionHeader from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the title', () => {
    render(<SectionHeader title="Credentials" />);
    expect(screen.getByRole('heading', { level: 5, name: 'Credentials' })).toBeInTheDocument();
  });

  it('renders action children on the right', () => {
    render(
      <SectionHeader title="Sessions">
        <button>Sign out</button>
      </SectionHeader>,
    );
    expect(screen.getByRole('heading', { name: 'Sessions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('applies className for spacing', () => {
    const { container } = render(<SectionHeader title="Profile" className="mt-5" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('mt-5');
    expect(wrapper.className).toContain('d-flex');
    expect(wrapper.className).toContain('mb-3');
  });

  it('does not add extra space when className is empty', () => {
    const { container } = render(<SectionHeader title="Test" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toBe('d-flex justify-content-between align-items-center mb-3');
  });

  it('renders without children', () => {
    const { container } = render(<SectionHeader title="Danger Zone" className="mt-5" />);
    expect(screen.getByRole('heading', { name: 'Danger Zone' })).toBeInTheDocument();
    // Only the h5 inside the wrapper
    expect(container.firstElementChild!.children).toHaveLength(1);
  });
});
