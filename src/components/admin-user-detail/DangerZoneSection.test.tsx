import { render, screen, fireEvent, act } from '@testing-library/react';

import * as api from '../../api';

import DangerZoneSection from './DangerZoneSection';

vi.mock('../../api', () => ({
  adminDeleteUser: vi.fn(),
  adminRevokeUserSessions: vi.fn(),
}));

const mockDeleteUser = vi.mocked(api.adminDeleteUser);
const mockRevokeSessions = vi.mocked(api.adminRevokeUserSessions);

const onDeleted = vi.fn();

function renderSection(username = 'alice') {
  return render(<DangerZoneSection userId="u1" username={username} onDeleted={onDeleted} />);
}

describe('DangerZoneSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Account actions' })).toBeInTheDocument();
  });

  it('renders Revoke sessions button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Revoke sessions' })).toBeInTheDocument();
  });

  it('renders Delete user button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Delete user' })).toBeInTheDocument();
  });

  it('renders descriptive text for revoke sessions', () => {
    renderSection();
    expect(screen.getByText('Log this user out of all devices immediately.')).toBeInTheDocument();
  });

  it('renders descriptive text for delete user', () => {
    renderSection();
    expect(
      screen.getByText(/This will permanently delete this user and all their data/),
    ).toBeInTheDocument();
  });

  describe('revoke sessions', () => {
    it('calls adminRevokeUserSessions when confirmed', async () => {
      mockRevokeSessions.mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
      });

      expect(window.confirm).toHaveBeenCalledWith(
        'Revoke all sessions for alice? They will be logged out of all devices.',
      );
      expect(mockRevokeSessions).toHaveBeenCalledWith('u1');
    });

    it('shows success alert after revoking sessions', async () => {
      mockRevokeSessions.mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
      });

      expect(screen.getByRole('status')).toHaveTextContent('All sessions revoked');
    });

    it('dismisses success alert when close button is clicked', async () => {
      mockRevokeSessions.mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
      });
      expect(screen.getByRole('status')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not call API when confirm is dismissed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
      });

      expect(mockRevokeSessions).not.toHaveBeenCalled();
    });

    it('shows error alert when revoke fails', async () => {
      mockRevokeSessions.mockRejectedValue(new Error('Network error'));
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderSection();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Revoke sessions' }));
      });

      expect(screen.getByRole('alert')).toHaveTextContent("Couldn't revoke sessions. Try again.");
    });
  });

  describe('delete user', () => {
    it('opens delete confirmation modal', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Delete user' })).toBeInTheDocument();
    });

    it('shows username in delete confirmation message', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent('permanently delete');
      expect(dialog).toHaveTextContent('alice');
    });

    it('disables confirm button until username is typed', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));

      const confirmBtn = screen.getByRole('button', { name: 'Delete this user' });
      expect(confirmBtn).toBeDisabled();

      fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
        target: { value: 'alice' },
      });
      expect(confirmBtn).toBeEnabled();
    });

    it('calls adminDeleteUser and onDeleted on confirmation', async () => {
      mockDeleteUser.mockResolvedValue(undefined);
      renderSection();

      fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
      fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
        target: { value: 'alice' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Delete this user' }));
      });

      expect(mockDeleteUser).toHaveBeenCalledWith('u1');
      expect(onDeleted).toHaveBeenCalled();
    });

    it('shows error and closes modal when delete fails', async () => {
      mockDeleteUser.mockRejectedValue(new Error('Server error'));
      renderSection();

      fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
      fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
        target: { value: 'alice' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Delete this user' }));
      });

      expect(screen.getByRole('alert')).toHaveTextContent("Couldn't delete this user. Try again.");
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onDeleted).not.toHaveBeenCalled();
    });

    it('closes modal on cancel', () => {
      renderSection();
      fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
