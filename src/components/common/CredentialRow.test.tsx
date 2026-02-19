import { render, screen, fireEvent } from '@testing-library/react';

import CredentialRow from './CredentialRow';

vi.mock('../../utils', () => ({
  formatRelativeTime: (ts: number) => `time-${ts}`,
}));

describe('CredentialRow', () => {
  it('renders passkey with fingerprint icon and name', () => {
    render(<CredentialRow kind="passkey" name="MacBook Pro" onDelete={vi.fn()} />);
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete passkey MacBook Pro' })).toBeInTheDocument();
  });

  it('renders passkey with created timestamp', () => {
    render(
      <CredentialRow kind="passkey" name="MacBook" createdAt={1700000000} onDelete={vi.fn()} />,
    );
    expect(screen.getByText(/Created time-1700000000/)).toBeInTheDocument();
  });

  it('renders API key with key icon and name', () => {
    render(<CredentialRow kind="apiKey" name="CI Key" onDelete={vi.fn()} />);
    expect(screen.getByText('CI Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revoke API key CI Key' })).toBeInTheDocument();
  });

  it('renders API key with prefix code when provided', () => {
    render(<CredentialRow kind="apiKey" name="CI Key" keyPrefix="rk_abc" onDelete={vi.fn()} />);
    expect(screen.getByText('rk_abc...')).toBeInTheDocument();
  });

  it('does not render prefix for passkeys', () => {
    const { container } = render(
      <CredentialRow kind="passkey" name="MacBook" keyPrefix="rk_abc" onDelete={vi.fn()} />,
    );
    expect(container.querySelector('code')).toBeNull();
  });

  it('shows expiry for temporary API keys', () => {
    render(
      <CredentialRow
        kind="apiKey"
        name="Temp Key"
        isTemporary
        expiresAt={1700100000}
        createdAt={1700000000}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Expires time-1700100000/)).toBeInTheDocument();
    expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
  });

  it('shows created time when not temporary', () => {
    render(
      <CredentialRow
        kind="apiKey"
        name="Perm Key"
        expiresAt={1700100000}
        createdAt={1700000000}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Created time-1700000000/)).toBeInTheDocument();
  });

  it('shows expired state when isExpired is true', () => {
    render(
      <CredentialRow
        kind="apiKey"
        name="Old Key"
        keyPrefix="rk_old"
        expiresAt={1700100000}
        createdAt={1700000000}
        isExpired
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Expired time-1700100000/)).toBeInTheDocument();
    expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Expires/)).not.toBeInTheDocument();
  });

  it('applies muted styling to expired API key name and prefix', () => {
    render(
      <CredentialRow
        kind="apiKey"
        name="Old Key"
        keyPrefix="rk_old"
        isExpired
        expiresAt={1700100000}
        onDelete={vi.fn()}
      />,
    );
    const nameEl = screen.getByText('Old Key');
    expect(nameEl).toHaveClass('text-body-tertiary');
    const codeEl = screen.getByText('rk_old...');
    expect(codeEl).toHaveClass('text-body-tertiary');
  });

  it('does not apply expired styling when isExpired is false', () => {
    render(
      <CredentialRow
        kind="apiKey"
        name="Active Key"
        keyPrefix="rk_act"
        isExpired={false}
        expiresAt={1700100000}
        createdAt={1700000000}
        onDelete={vi.fn()}
      />,
    );
    const nameEl = screen.getByText('Active Key');
    expect(nameEl).not.toHaveClass('text-body-tertiary');
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<CredentialRow kind="passkey" name="MacBook" onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete passkey MacBook' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
