import { render, screen, fireEvent } from '@testing-library/react';

import ModalBase from './ModalBase';

describe('ModalBase', () => {
  afterEach(() => {
    document.body.classList.remove('modal-open');
  });

  it('renders children inside modal content', () => {
    render(
      <ModalBase onClose={vi.fn()}>
        <div>Modal content</div>
      </ModalBase>,
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders with role="dialog" and aria-modal="true"', () => {
    render(
      <ModalBase onClose={vi.fn()} ariaLabel="Test">
        <div>Content</div>
      </ModalBase>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('applies aria-label when provided', () => {
    render(
      <ModalBase onClose={vi.fn()} ariaLabel="Test modal">
        <div>Content</div>
      </ModalBase>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Test modal');
  });

  it('applies aria-labelledby when provided', () => {
    render(
      <ModalBase onClose={vi.fn()} ariaLabelledBy="my-title">
        <div>Content</div>
      </ModalBase>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'my-title');
  });

  it('adds modal-dialog-scrollable class when scrollable is true', () => {
    render(
      <ModalBase onClose={vi.fn()} scrollable>
        <div>Content</div>
      </ModalBase>,
    );
    const dialog = document.querySelector('.modal-dialog');
    expect(dialog).toHaveClass('modal-dialog-scrollable');
  });

  it('does not add modal-dialog-scrollable class by default', () => {
    render(
      <ModalBase onClose={vi.fn()}>
        <div>Content</div>
      </ModalBase>,
    );
    const dialog = document.querySelector('.modal-dialog');
    expect(dialog).not.toHaveClass('modal-dialog-scrollable');
  });

  it('always adds modal-dialog-centered class', () => {
    render(
      <ModalBase onClose={vi.fn()}>
        <div>Content</div>
      </ModalBase>,
    );
    const dialog = document.querySelector('.modal-dialog');
    expect(dialog).toHaveClass('modal-dialog-centered');
  });

  it('adds modal-open class to body on mount', () => {
    render(
      <ModalBase onClose={vi.fn()}>
        <div>Content</div>
      </ModalBase>,
    );
    expect(document.body.classList.contains('modal-open')).toBe(true);
  });

  it('removes modal-open class from body on unmount', () => {
    const { unmount } = render(
      <ModalBase onClose={vi.fn()}>
        <div>Content</div>
      </ModalBase>,
    );
    expect(document.body.classList.contains('modal-open')).toBe(true);
    unmount();
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(
      <ModalBase onClose={onClose} ariaLabel="Test">
        <div>Content</div>
      </ModalBase>,
    );
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(
      <ModalBase onClose={onClose}>
        <div>Content</div>
      </ModalBase>,
    );
    fireEvent.mouseDown(screen.getByText('Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders backdrop element', () => {
    const { container } = render(
      <ModalBase onClose={vi.fn()}>
        <div>Content</div>
      </ModalBase>,
    );
    expect(container.querySelector('.modal-backdrop')).toBeInTheDocument();
  });
});
