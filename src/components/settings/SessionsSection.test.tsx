import { render, screen, fireEvent } from '@testing-library/react';

import type { SessionInfo } from '../../api';

import SessionsSection from './SessionsSection';

const sampleSessions: SessionInfo[] = [
  {
    familyID: 'fam-1',
    deviceName: 'Chrome on macOS',
    sessionCreatedAt: 1700000000,
    lastRefreshedAt: 1700050000,
    expiresAt: 1702592000,
  },
  {
    familyID: 'fam-2',
    deviceName: 'Safari on iPhone',
    sessionCreatedAt: 1700100000,
    lastRefreshedAt: null,
    expiresAt: 1702692000,
  },
];

const onLogout = vi.fn();
const onRevokeSessions = vi.fn();
const onRevokeSession = vi.fn();

function renderSection({
  sessions = sampleSessions,
  isRevokingSessions = false,
}: { sessions?: SessionInfo[] | null; isRevokingSessions?: boolean } = {}) {
  return render(
    <SessionsSection
      sessions={sessions}
      isRevokingSessions={isRevokingSessions}
      onLogout={onLogout}
      onRevokeSessions={onRevokeSessions}
      onRevokeSession={onRevokeSession}
    />,
  );
}

describe('SessionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header with title', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Sessions' })).toBeInTheDocument();
  });

  it('renders Sign out button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('renders Sign out everywhere dropdown option', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Sign out everywhere' })).toBeInTheDocument();
  });

  it('renders session list with device names', () => {
    renderSection();
    expect(screen.getByText('Chrome on macOS')).toBeInTheDocument();
    expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
  });

  it('renders empty state when sessions is empty', () => {
    renderSection({ sessions: [] });
    expect(screen.getByText('No active sessions')).toBeInTheDocument();
  });

  it('renders empty state when sessions is null', () => {
    renderSection({ sessions: null });
    expect(screen.getByText('No active sessions')).toBeInTheDocument();
  });

  it('renders revoke button for each session', () => {
    renderSection();
    expect(
      screen.getByRole('button', { name: 'Revoke session Chrome on macOS' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Revoke session Safari on iPhone' }),
    ).toBeInTheDocument();
  });

  it('calls onLogout when Sign out is clicked', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onRevokeSessions when Sign out everywhere is clicked', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out everywhere' }));
    expect(onRevokeSessions).toHaveBeenCalledTimes(1);
  });

  it('disables Sign out everywhere when isRevokingSessions is true', () => {
    renderSection({ isRevokingSessions: true });
    expect(screen.getByRole('button', { name: 'Sign out everywhere' })).toBeDisabled();
  });

  it('calls onRevokeSession with familyID when revoke button is clicked', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke session Chrome on macOS' }));
    expect(onRevokeSession).toHaveBeenCalledWith('fam-1');
  });

  it('renders session timestamps', () => {
    renderSection();
    const createdElements = screen.getAllByText(/Created/);
    expect(createdElements.length).toBe(2);
    const expiresElements = screen.getAllByText(/Expires/);
    expect(expiresElements.length).toBe(2);
  });

  it('shows last active time when lastRefreshedAt is set', () => {
    renderSection();
    expect(screen.getByText(/Last active/)).toBeInTheDocument();
  });

  describe('connected apps', () => {
    const appSession: SessionInfo = {
      familyID: 'fam-app',
      deviceName: 'Claude Code',
      sessionCreatedAt: 1700000000,
      lastRefreshedAt: null,
      expiresAt: 1702592000,
      clientID: 'client-123',
    };
    const deviceSession: SessionInfo = { ...sampleSessions[0], clientID: null };

    it('labels an app session and gives it an app icon', () => {
      const { container } = renderSection({ sessions: [appSession] });
      const row = screen.getByText('Claude Code').closest('.list-group-item') as HTMLElement;
      expect(row).toHaveTextContent('Connected app');
      expect(row.querySelector('.bi-plug')).toBeInTheDocument();
      expect(container.querySelector('.bi-display')).not.toBeInTheDocument();
    });

    it('shows a device session without the app label', () => {
      const { container } = renderSection({ sessions: [deviceSession] });
      expect(screen.queryByText('Connected app')).not.toBeInTheDocument();
      expect(container.querySelector('.bi-display')).toBeInTheDocument();
      expect(container.querySelector('.bi-plug')).not.toBeInTheDocument();
    });

    it('names the revoke action for apps and devices', () => {
      renderSection({ sessions: [appSession, deviceSession] });
      expect(
        screen.getByRole('button', { name: 'Revoke access for Claude Code' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Revoke session Chrome on macOS' }),
      ).toBeInTheDocument();
    });

    it('revokes an app session by its familyID', () => {
      renderSection({ sessions: [appSession] });
      fireEvent.click(screen.getByRole('button', { name: 'Revoke access for Claude Code' }));
      expect(onRevokeSession).toHaveBeenCalledWith('fam-app');
    });
  });
});
