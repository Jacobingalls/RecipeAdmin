import type { ReactElement } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { AdminUserListItem } from '../api';
import * as api from '../api';
import { useApiQuery } from '../hooks';

import AdminUsersPage from './AdminUsersPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', () => ({
  adminListUsers: vi.fn(),
  adminCreateUser: vi.fn(),
}));

vi.mock('../components/common', async () => {
  const actual = await vi.importActual('../components/common');
  return {
    ...actual,
    LoadingState: () => <div data-testid="loading-state" />,
    ErrorState: ({ message }: { message: string }) => (
      <div data-testid="error-state">{message}</div>
    ),
  };
});

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockAdminCreateUser = vi.mocked(api.adminCreateUser);

const sampleUsers: AdminUserListItem[] = [
  {
    id: 'u1',
    username: 'alice',
    displayName: 'Alice',
    email: 'alice@example.com',
    isAdmin: true,
    createdAt: 1700000000,
    lastLoginAt: Date.now() / 1000 - 3600,
    passkeyCount: 2,
    apiKeyCount: 1,
  },
  {
    id: 'u2',
    username: 'bob',
    displayName: 'Bob',
    email: 'bob@example.com',
    isAdmin: false,
    createdAt: 1700000000,
    lastLoginAt: null,
    passkeyCount: 0,
    apiKeyCount: 3,
  },
];

function mockQuery(overrides: Partial<UseApiQueryResult<AdminUserListItem[]>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<AdminUserListItem[]>);
}

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Server error' });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders user list with display names and usernames', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/alice/)).toBeInTheDocument();
    expect(screen.getByText(/bob/)).toBeInTheDocument();
  });

  it('renders empty state when no users match filters', () => {
    mockQuery({ data: [] });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByText('No users')).toBeInTheDocument();
  });

  it('shows last login time for users', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByText(/1h ago/)).toBeInTheDocument();
    expect(screen.getByText('Never logged in')).toBeInTheDocument();
  });

  it('renders search input and role filter', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All users')).toBeInTheDocument();
  });

  it('filters users by name', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    fireEvent.change(screen.getByPlaceholderText('Search users...'), {
      target: { value: 'alice' },
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('filters users by email', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    fireEvent.change(screen.getByPlaceholderText('Search users...'), {
      target: { value: 'bob@example' },
    });
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('filters users by role', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    fireEvent.change(screen.getByDisplayValue('All users'), { target: { value: 'admin' } });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('shows add user modal when button clicked', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('closes modal via close button', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('creates user and shows temp API key', async () => {
    const refetch = vi.fn();
    mockQuery({ data: sampleUsers, refetch });
    mockAdminCreateUser.mockResolvedValue({
      user: {
        id: 'u3',
        username: 'charlie',
        displayName: 'Charlie',
        email: 'charlie@example.com',
        isAdmin: false,
        createdAt: null,
        passkeyCount: 0,
        apiKeyCount: 1,
      },
      temporaryAPIKey: 'temp-key-abc123',
    });

    renderWithRouter(<AdminUsersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'New' }));

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'charlie' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'charlie@example.com' } });
    const submitBtn = screen.getByRole('dialog').querySelector('button[type="submit"]')!;
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockAdminCreateUser).toHaveBeenCalledWith(
      'charlie',
      'Charlie',
      'charlie@example.com',
      false,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('User created')).toBeInTheDocument();
    expect(screen.getByText('temp-key-abc123')).toBeInTheDocument();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('closes modal when Done is clicked on success view', async () => {
    const refetch = vi.fn();
    mockQuery({ data: sampleUsers, refetch });
    mockAdminCreateUser.mockResolvedValue({
      user: {
        id: 'u3',
        username: 'charlie',
        displayName: 'Charlie',
        email: 'charlie@example.com',
        isAdmin: false,
        createdAt: null,
        passkeyCount: 0,
        apiKeyCount: 1,
      },
      temporaryAPIKey: 'temp-key-abc123',
    });

    renderWithRouter(<AdminUsersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'charlie' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'charlie@example.com' } });
    const submitBtn = screen.getByRole('dialog').querySelector('button[type="submit"]')!;
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('renders links to user detail pages', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/admin/users/u1');
    expect(links[1]).toHaveAttribute('href', '/admin/users/u2');
  });

  it('uses consistent h1 page title', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Users' });
    expect(heading).toBeInTheDocument();
  });
});
