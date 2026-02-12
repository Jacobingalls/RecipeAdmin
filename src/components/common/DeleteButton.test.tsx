import { render, screen, fireEvent } from '@testing-library/react';

import DeleteButton from './DeleteButton';

describe('DeleteButton', () => {
  it('renders a button with the given aria-label', () => {
    render(<DeleteButton ariaLabel="Delete passkey Main" onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Delete passkey Main' })).toBeInTheDocument();
  });

  it('renders a trash icon', () => {
    render(<DeleteButton ariaLabel="Delete" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    const icon = button.querySelector('.bi-trash');
    expect(icon).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<DeleteButton ariaLabel="Delete item" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has correct sizing styles', () => {
    render(<DeleteButton ariaLabel="Delete" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.style.width).toBe('2rem');
    expect(button.style.height).toBe('2rem');
  });
});
