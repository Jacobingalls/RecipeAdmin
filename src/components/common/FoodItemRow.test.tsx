import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import FoodItemRow from './FoodItemRow';

function renderFoodItemRow(props: Partial<Parameters<typeof FoodItemRow>[0]> = {}) {
  const defaultProps = {
    name: 'Test Item',
    subtitle: 'test subtitle',
    calories: 200,
    ariaLabel: 'View Test Item',
    onClick: vi.fn(),
    ...props,
  };
  return { ...render((<FoodItemRow {...defaultProps} />) as ReactElement), props: defaultProps };
}

describe('FoodItemRow', () => {
  it('renders name and subtitle', () => {
    renderFoodItemRow();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('test subtitle')).toBeInTheDocument();
  });

  it('renders calories', () => {
    renderFoodItemRow({ calories: 320 });
    expect(screen.getByText('320 kcal')).toBeInTheDocument();
  });

  it('renders placeholder when calories is null', () => {
    renderFoodItemRow({ calories: null });
    expect(screen.getByText('-- kcal')).toBeInTheDocument();
  });

  it('renders as a list-group-item with action class', () => {
    renderFoodItemRow();
    const row = screen.getByRole('button', { name: 'View Test Item' });
    expect(row).toHaveClass('list-group-item', 'list-group-item-action');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderFoodItemRow({ onClick });
    fireEvent.click(screen.getByRole('button', { name: 'View Test Item' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn();
    renderFoodItemRow({ onClick });
    fireEvent.keyDown(screen.getByRole('button', { name: 'View Test Item' }), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Space key', () => {
    const onClick = vi.fn();
    renderFoodItemRow({ onClick });
    fireEvent.keyDown(screen.getByRole('button', { name: 'View Test Item' }), { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick on other keys', () => {
    const onClick = vi.fn();
    renderFoodItemRow({ onClick });
    fireEvent.keyDown(screen.getByRole('button', { name: 'View Test Item' }), { key: 'Tab' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders children (action buttons)', () => {
    renderFoodItemRow({
      children: (
        <button type="button" data-testid="action-btn">
          Action
        </button>
      ),
    });
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('renders JSX subtitle content', () => {
    renderFoodItemRow({
      subtitle: (
        <>
          <span>Brand</span> &middot; <span>1 serving</span>
        </>
      ),
    });
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('has tabIndex 0 for keyboard focus', () => {
    renderFoodItemRow();
    expect(screen.getByRole('button', { name: 'View Test Item' })).toHaveAttribute('tabindex', '0');
  });

  it('truncates long names', () => {
    renderFoodItemRow({ name: 'A very long product name' });
    const nameEl = screen.getByText('A very long product name');
    expect(nameEl).toHaveClass('text-truncate');
  });
});
