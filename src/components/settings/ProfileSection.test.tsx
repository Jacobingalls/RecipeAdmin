import { render, screen, fireEvent, act } from '@testing-library/react';

import * as api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

import ProfileSection from './ProfileSection';

vi.mock('../../api', () => ({
  settingsUpdateProfile: vi.fn(),
}));

const mockUpdateUser = vi.fn();
const mockRefreshSession = vi.fn().mockResolvedValue(undefined);

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUpdateProfile = vi.mocked(api.settingsUpdateProfile);

const defaultUser = {
  id: '1',
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  isAdmin: false,
  hasPasskeys: true,
};

function setupAuth(user = defaultUser) {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    user,
    isLoading: false,
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    logout: vi.fn(),
    updateUser: mockUpdateUser,
    refreshSession: mockRefreshSession,
  });
}

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAuth();
  });

  it('renders profile heading', () => {
    render(<ProfileSection />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });

  it('displays username', () => {
    render(<ProfileSection />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('displays display name', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays email', () => {
    render(<ProfileSection />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders edit button for display name', () => {
    render(<ProfileSection />);
    expect(screen.getByRole('button', { name: 'Edit display name' })).toBeInTheDocument();
  });

  it('shows edit form when edit button is clicked', () => {
    render(<ProfileSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('cancels edit and returns to display mode', () => {
    render(<ProfileSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByDisplayValue('Test User')).not.toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('saves display name, updates user, refreshes session, and shows success', async () => {
    const updatedUser = { ...defaultUser, displayName: 'New Name' };
    mockUpdateProfile.mockResolvedValue(updatedUser);
    render(<ProfileSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    fireEvent.change(screen.getByDisplayValue('Test User'), {
      target: { value: 'New Name' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith({ displayName: 'New Name' });
    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    expect(mockRefreshSession).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Display name updated.');
  });

  it('exits edit mode after successful save', async () => {
    mockUpdateProfile.mockResolvedValue({ ...defaultUser, displayName: 'New Name' });
    render(<ProfileSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    fireEvent.change(screen.getByDisplayValue('Test User'), {
      target: { value: 'New Name' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit display name' })).toBeInTheDocument();
  });

  it('shows error message when save fails', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('Network error'));
    render(<ProfileSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    fireEvent.change(screen.getByDisplayValue('Test User'), {
      target: { value: 'New Name' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't update your profile. Try again.");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('remains in edit mode after save fails', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('Network error'));
    render(<ProfileSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('clears success message when entering edit mode again', async () => {
    mockUpdateProfile.mockResolvedValue({ ...defaultUser, displayName: 'X' });
    render(<ProfileSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
