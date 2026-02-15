import { render, screen } from '@testing-library/react';

import CircularButton from './CircularButton';
import CircularButtonGroup from './CircularButtonGroup';

describe('CircularButtonGroup', () => {
  it('renders children', () => {
    render(
      <CircularButtonGroup>
        <CircularButton aria-label="Test">Click me</CircularButton>
      </CircularButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });

  it('has role="group"', () => {
    render(
      <CircularButtonGroup>
        <CircularButton aria-label="Test" />
      </CircularButtonGroup>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('has pill border-radius', () => {
    render(
      <CircularButtonGroup>
        <CircularButton aria-label="Test" />
      </CircularButtonGroup>,
    );
    expect(screen.getByRole('group').style.borderRadius).toBe('1.375rem');
  });

  it('has a subtle constant background', () => {
    render(
      <CircularButtonGroup>
        <CircularButton aria-label="Test" />
      </CircularButtonGroup>,
    );
    expect(screen.getByRole('group').style.backgroundColor).toBe(
      'rgba(var(--bs-body-color-rgb), 0.05)',
    );
  });

  it('applies overlap class to container', () => {
    render(
      <CircularButtonGroup>
        <CircularButton aria-label="One" />
        <CircularButton aria-label="Two" />
      </CircularButtonGroup>,
    );
    expect(screen.getByRole('group')).toHaveClass('circular-btn-group');
  });

  it('injects overlap and hover z-index style rules', () => {
    const { container } = render(
      <CircularButtonGroup>
        <CircularButton aria-label="One" />
      </CircularButtonGroup>,
    );
    const style = container.querySelector('style');
    expect(style).toBeInTheDocument();
    expect(style!.textContent).toContain('margin-left: -0.375rem');
    expect(style!.textContent).toContain('z-index: 1');
  });

  it('renders multiple children', () => {
    render(
      <CircularButtonGroup>
        <CircularButton aria-label="One" />
        <CircularButton aria-label="Two" />
      </CircularButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument();
  });
});
