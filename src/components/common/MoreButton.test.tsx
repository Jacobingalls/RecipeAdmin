import { render, screen, fireEvent } from '@testing-library/react';

import MoreButton from './MoreButton';

describe('MoreButton', () => {
  it('renders a button with the correct aria-label', () => {
    render(<MoreButton ariaLabel="Item actions" />);
    expect(screen.getByRole('button', { name: 'Item actions' })).toBeInTheDocument();
  });

  it('has data-bs-toggle="dropdown"', () => {
    render(<MoreButton ariaLabel="Item actions" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-bs-toggle', 'dropdown');
  });

  it('stops click propagation', () => {
    const parentHandler = vi.fn();
    render(
      <div onClick={parentHandler} onKeyDown={parentHandler} role="button" tabIndex={0}>
        <MoreButton ariaLabel="Item actions" />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Item actions' }));
    expect(parentHandler).not.toHaveBeenCalled();
  });

  it('stops keydown propagation', () => {
    const parentHandler = vi.fn();
    render(
      <div onClick={parentHandler} onKeyDown={parentHandler} role="button" tabIndex={0}>
        <MoreButton ariaLabel="Item actions" />
      </div>,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Item actions' }), { key: 'Enter' });
    expect(parentHandler).not.toHaveBeenCalled();
  });

  it('renders the three-dots icon', () => {
    render(<MoreButton ariaLabel="Item actions" />);
    const icon = screen.getByRole('button').querySelector('.bi-three-dots');
    expect(icon).toBeInTheDocument();
  });
});
