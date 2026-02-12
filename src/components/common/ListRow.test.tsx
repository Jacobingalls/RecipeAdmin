import { render, screen } from '@testing-library/react';

import ListRow from './ListRow';

describe('ListRow', () => {
  it('renders content', () => {
    render(<ListRow content={<strong>My Passkey</strong>} />);
    expect(screen.getByText('My Passkey')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    const { container } = render(<ListRow icon="bi-fingerprint" content={<span>Item</span>} />);
    const icon = container.querySelector('.bi-fingerprint');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render an icon when not provided', () => {
    const { container } = render(<ListRow content={<span>Item</span>} />);
    const icon = container.querySelector('.bi');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders secondary content', () => {
    render(<ListRow content={<span>Item</span>} secondary={<>Created yesterday</>} />);
    expect(screen.getByText('Created yesterday')).toBeInTheDocument();
  });

  it('renders children (actions)', () => {
    render(
      <ListRow content={<span>Item</span>}>
        <button type="button">Delete</button>
      </ListRow>,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders as a list-group-item with flex layout', () => {
    const { container } = render(<ListRow content={<span>Item</span>} />);
    const row = container.firstElementChild!;
    expect(row.classList.contains('list-group-item')).toBe(true);
    expect(row.classList.contains('d-flex')).toBe(true);
    expect(row.classList.contains('align-items-center')).toBe(true);
  });
});
