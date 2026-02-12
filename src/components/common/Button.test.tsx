import { render, screen, fireEvent } from '@testing-library/react';

import Button from './Button';

describe('Button', () => {
  it('renders children as button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('defaults to variant="primary"', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary');
  });

  it('applies variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-danger');
  });

  it('applies outline variant class', () => {
    render(<Button variant="outline-secondary">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-outline-secondary');
  });

  it('applies size class when provided', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-sm');
  });

  it('does not add size class when not provided', () => {
    render(<Button>Normal</Button>);
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveClass('btn-sm');
    expect(btn).not.toHaveClass('btn-lg');
  });

  it('supports type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('passes additional className', () => {
    render(<Button className="flex-shrink-0">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary', 'flex-shrink-0');
  });

  it('forwards onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards aria-label', () => {
    render(<Button aria-label="Close dialog">X</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog');
  });

  describe('loading prop', () => {
    it('shows spinner and hides children when loading', () => {
      const { container } = render(<Button loading>Save</Button>);
      expect(container.querySelector('.spinner-border')).toBeInTheDocument();
      expect(screen.getByText('Loading')).toHaveClass('visually-hidden');
    });

    it('disables the button when loading', () => {
      render(<Button loading>Save</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('sets aria-busy when loading', () => {
      render(<Button loading>Save</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
    });

    it('does not show spinner when not loading', () => {
      const { container } = render(<Button>Save</Button>);
      expect(container.querySelector('.spinner-border')).not.toBeInTheDocument();
    });

    it('preserves children in DOM for sizing when loading', () => {
      render(<Button loading>Save</Button>);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('disables even without explicit disabled prop when loading', () => {
      render(<Button loading>Save</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
