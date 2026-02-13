import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ProductGroupData } from '../domain';
import { useApiQuery } from '../hooks';

import AdminGroupEditorPage from './AdminGroupEditorPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/groups/:id" element={<AdminGroupEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockQuery(overrides: Partial<UseApiQueryResult<ProductGroupData>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ProductGroupData>);
}

const sampleGroup: ProductGroupData = {
  id: 'g1',
  name: 'Breakfast Bowl',
  items: [
    { product: { id: 'p1', name: 'Oats' }, preparationID: 'prep1' },
    { product: { id: 'p2', name: 'Milk' }, preparationID: 'prep2' },
  ],
};

describe('AdminGroupEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockQuery({ loading: true });
    renderWithRoute('/admin/groups/g1');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockQuery({ error: 'Network error' });
    renderWithRoute('/admin/groups/g1');
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders not found when group is null', () => {
    mockQuery({ data: null });
    renderWithRoute('/admin/groups/g1');
    expect(screen.getByTestId('content-unavailable-view')).toBeInTheDocument();
    expect(screen.getByText('Group not found')).toBeInTheDocument();
  });

  it('renders group name and item count with coming soon placeholder', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/admin/groups/g1');
    expect(screen.getByText('Breakfast Bowl')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('links to the viewer page', () => {
    mockQuery({ data: sampleGroup });
    renderWithRoute('/admin/groups/g1');
    const link = screen.getByRole('link', { name: 'View group' });
    expect(link).toHaveAttribute('href', '/groups/g1');
  });

  it('renders singular item count for single item', () => {
    mockQuery({ data: { ...sampleGroup, items: [sampleGroup.items![0]] } });
    renderWithRoute('/admin/groups/g1');
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('renders 0 items when items is undefined', () => {
    mockQuery({ data: { ...sampleGroup, items: undefined } });
    renderWithRoute('/admin/groups/g1');
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });
});
