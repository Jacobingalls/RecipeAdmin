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

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
}));

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

  it('renders user list', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders empty state when no users', () => {
    mockQuery({ data: [] });
    renderWithRouter(<AdminUsersPage />);
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('shows create user form when button clicked', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    fireEvent.click(screen.getByText('Create User'));
    expect(screen.getByText('Create New User')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Create User'));

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'charlie' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'charlie@example.com' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    });

    expect(mockAdminCreateUser).toHaveBeenCalledWith(
      'charlie',
      'Charlie',
      'charlie@example.com',
      false,
    );
    expect(screen.getByText('User created successfully')).toBeInTheDocument();
    expect(screen.getByText('temp-key-abc123')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('renders links to user detail pages', () => {
    mockQuery({ data: sampleUsers });
    renderWithRouter(<AdminUsersPage />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/admin/users/u1');
    expect(links[1]).toHaveAttribute('href', '/admin/users/u2');
  });
});
