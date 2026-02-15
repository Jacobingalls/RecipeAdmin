import { render, screen, fireEvent } from '@testing-library/react';

import CircularButton from './CircularButton';

describe('CircularButton', () => {
  it('renders a button with children', () => {
    render(
      <CircularButton aria-label="Test">
        <i className="bi bi-star" />
      </CircularButton>,
    );
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('.bi-star')).toBeInTheDocument();
  });

  it('has 2.25rem width and height', () => {
    render(<CircularButton aria-label="Test" />);
    const btn = screen.getByRole('button');
    expect(btn.style.width).toBe('2.25rem');
    expect(btn.style.height).toBe('2.25rem');
  });

  it('has rounded-circle class', () => {
    render(<CircularButton aria-label="Test" />);
    expect(screen.getByRole('button')).toHaveClass('rounded-circle');
  });

  it('passes through extra HTML attributes', () => {
    const onClick = vi.fn();
    render(<CircularButton aria-label="Test" data-bs-toggle="dropdown" onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-bs-toggle', 'dropdown');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('merges additional className', () => {
    render(<CircularButton aria-label="Test" className="flex-shrink-0" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('flex-shrink-0');
    expect(btn).toHaveClass('btn');
  });

  it('always renders type="button"', () => {
    render(<CircularButton aria-label="Test" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('has common button classes', () => {
    render(<CircularButton aria-label="Test" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn', 'btn-sm', 'border-0', 'p-0', 'text-body-secondary');
  });

  it('can be disabled', () => {
    render(<CircularButton aria-label="Test" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
