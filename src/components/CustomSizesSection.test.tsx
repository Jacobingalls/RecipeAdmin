import { render, screen, fireEvent } from '@testing-library/react';

import { CustomSize } from '../domain';

import CustomSizesSection from './CustomSizesSection';

const cookie = new CustomSize({ name: 'cookie', servings: 0.5, notes: ['About 30g'] });
const slice = new CustomSize({
  name: 'slice',
  servingSize: { kind: 'mass', amount: { amount: 28, unit: 'g' } },
});

describe('CustomSizesSection', () => {
  it('returns null when customSizes is undefined', () => {
    const { container } = render(<CustomSizesSection />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when customSizes is empty', () => {
    const { container } = render(<CustomSizesSection customSizes={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading', () => {
    render(<CustomSizesSection customSizes={[cookie]} />);
    expect(screen.getByText('Custom Sizes')).toBeInTheDocument();
  });

  it('renders custom size names', () => {
    render(<CustomSizesSection customSizes={[cookie, slice]} />);
    expect(screen.getByText('cookie')).toBeInTheDocument();
    expect(screen.getByText('slice')).toBeInTheDocument();
  });

  it('renders description when available', () => {
    render(<CustomSizesSection customSizes={[cookie]} />);
    expect(screen.getByText('(0.5 servings)')).toBeInTheDocument();
  });

  it('renders Use button for each custom size', () => {
    const onSelectSize = vi.fn();
    render(<CustomSizesSection customSizes={[cookie, slice]} onSelectSize={onSelectSize} />);
    const buttons = screen.getAllByRole('button', { name: 'Use' });
    expect(buttons).toHaveLength(2);
  });

  it('calls onSelectSize with correct customSize ServingSize when Use is clicked', () => {
    const onSelectSize = vi.fn();
    render(<CustomSizesSection customSizes={[cookie]} onSelectSize={onSelectSize} />);
    fireEvent.click(screen.getByTitle('Set serving to 1 cookie'));
    expect(onSelectSize).toHaveBeenCalledTimes(1);
    const arg = onSelectSize.mock.calls[0][0];
    expect(arg.type).toBe('customSize');
    expect(arg.value).toEqual({ name: 'cookie', amount: 1 });
  });

  it('renders notes when present', () => {
    render(<CustomSizesSection customSizes={[cookie]} />);
    expect(screen.getByText('About 30g')).toBeInTheDocument();
  });

  it('does not render notes when absent', () => {
    render(<CustomSizesSection customSizes={[slice]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('works without onSelectSize prop', () => {
    render(<CustomSizesSection customSizes={[cookie]} />);
    const button = screen.getByTitle('Set serving to 1 cookie');
    // Should not throw when clicked without handler
    fireEvent.click(button);
  });
});
