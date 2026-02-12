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

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<CredentialRow kind="passkey" name="MacBook" onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete passkey MacBook' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
