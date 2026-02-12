import { render, screen, fireEvent } from '@testing-library/react';

import ModalBase, { ModalHeader, ModalBody, ModalFooter } from './ModalBase';

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

describe('ModalHeader', () => {
  it('renders title in an h5', () => {
    render(<ModalHeader onClose={vi.fn()}>My Title</ModalHeader>);
    const heading = screen.getByRole('heading', { level: 5, name: 'My Title' });
    expect(heading).toHaveClass('modal-title');
  });

  it('applies titleId to the h5', () => {
    render(
      <ModalHeader onClose={vi.fn()} titleId="my-id">
        Title
      </ModalHeader>,
    );
    expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('id', 'my-id');
  });

  it('renders a close button that calls onClose', () => {
    const onClose = vi.fn();
    render(<ModalHeader onClose={onClose}>Title</ModalHeader>);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps content in a modal-header div', () => {
    const { container } = render(<ModalHeader onClose={vi.fn()}>Title</ModalHeader>);
    expect(container.querySelector('.modal-header')).toBeInTheDocument();
  });
});

describe('ModalBody', () => {
  it('renders children inside a modal-body div', () => {
    const { container } = render(<ModalBody>Body content</ModalBody>);
    expect(container.querySelector('.modal-body')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('ModalFooter', () => {
  it('renders children inside a modal-footer div', () => {
    const { container } = render(<ModalFooter>Footer content</ModalFooter>);
    expect(container.querySelector('.modal-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
