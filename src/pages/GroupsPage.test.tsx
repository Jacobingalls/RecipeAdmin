import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiGroupSummary } from '../api';
import { useApiQuery } from '../hooks';

import GroupsPage from './GroupsPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', async () => {
  const actual = await vi.importActual('../components/common');
  return {
    ...actual,
    LoadingState: () => <div data-testid="loading-state" />,
    ErrorState: ({ message }: { message: string }) => (
      <div data-testid="error-state">{message}</div>
    ),
    ContentUnavailableView: ({ title }: { title: string }) => (
      <div data-testid="content-unavailable-view">{title}</div>
    ),
  };
});

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function mockQuery(overrides: Partial<UseApiQueryResult<ApiGroupSummary[]>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiGroupSummary[]>);
}

const sampleGroups: ApiGroupSummary[] = [
  { id: 'g1', name: 'Breakfast', items: [{ id: 'i1' }, { id: 'i2' }] },
  { id: 'g2', name: 'Lunch', items: [{ id: 'i3' }] },
  { id: 'g3', name: 'Dinner', items: [] },
];

describe('GroupsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with page chrome', () => {
    mockQuery({ loading: true });
    renderWithRouter(<GroupsPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
  });

  it('renders error state with page chrome', () => {
    mockQuery({ error: 'Network error' });
    renderWithRouter(<GroupsPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
  });

  it('renders empty state when no groups match', () => {
    mockQuery({ data: [] });
    renderWithRouter(<GroupsPage />);
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('renders groups with item counts', () => {
    mockQuery({ data: sampleGroups });
    renderWithRouter(<GroupsPage />);
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('2 item(s)')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('1 item(s)')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('0 item(s)')).toBeInTheDocument();
  });

  it('renders group links with correct hrefs', () => {
    mockQuery({ data: sampleGroups });
    renderWithRouter(<GroupsPage />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/admin/groups/g1');
    expect(links[1]).toHaveAttribute('href', '/admin/groups/g2');
  });

  it('filters groups by name', () => {
    mockQuery({ data: sampleGroups });
    renderWithRouter(<GroupsPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'break' } });
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.queryByText('Lunch')).not.toBeInTheDocument();
    expect(screen.queryByText('Dinner')).not.toBeInTheDocument();
  });

  it('shows empty state when filter matches nothing', () => {
    mockQuery({ data: sampleGroups });
    renderWithRouter(<GroupsPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
  });

  it('filter is case-insensitive', () => {
    mockQuery({ data: sampleGroups });
    renderWithRouter(<GroupsPage />);
    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(input, { target: { value: 'LUNCH' } });
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    mockQuery({ data: sampleGroups });
    renderWithRouter(<GroupsPage />);
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });
});
