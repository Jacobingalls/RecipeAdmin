import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ProductGroupData } from '../domain';
import type { IndirectGroup } from '../api';
import { resolveIndirectGroup } from '../api';
import { useApiQuery } from '../hooks';

import AdminGroupEditorPage from './AdminGroupEditorPage';

vi.mock('../hooks', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../api', () => ({
  adminGetGroup: vi.fn(),
  adminUpsertGroups: vi.fn(),
  resolveIndirectGroup: vi.fn(),
}));

vi.mock('../components/common', () => ({
  LoadingState: () => <div data-testid="loading-state" />,
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
  ContentUnavailableView: ({ title }: { title: string }) => (
    <div data-testid="content-unavailable-view">{title}</div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  SectionHeader: ({ title, children }: { title: string; children?: ReactNode }) => (
    <div data-testid={`section-${title.toLowerCase()}`}>
      <h5>{title}</h5>
      {children}
    </div>
  ),
}));

vi.mock('../components/admin-product-editor', () => ({
  NotesSection: () => <div data-testid="notes-section" />,
}));

vi.mock('../components/admin-group-editor', () => ({
  GroupProfileForm: ({ group }: { group: ProductGroupData }) => (
    <div data-testid="group-profile-form">{group.name}</div>
  ),
  GroupServingSection: () => <div data-testid="group-serving-section" />,
  GroupItemsSection: ({ group }: { group: ProductGroupData }) => (
    <div data-testid="group-items-section">{group.items?.length ?? 0} items</div>
  ),
  GroupCustomSizesSection: () => <div data-testid="group-custom-sizes-section" />,
  GroupCategoriesSection: () => <div data-testid="group-categories-section" />,
  GroupBarcodesSection: () => <div data-testid="group-barcodes-section" />,
  GroupDangerZone: () => <div data-testid="group-danger-zone" />,
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockResolveIndirectGroup = vi.mocked(resolveIndirectGroup);

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/groups/:id" element={<AdminGroupEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockQuery(overrides: Partial<UseApiQueryResult<IndirectGroup>>) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<IndirectGroup>);
}

const sampleIndirectGroup: IndirectGroup = {
  id: 'g1',
  name: 'Breakfast Bowl',
  brand: 'Homemade',
  items: [
    { kind: 'product', productID: 'p1', preparationID: 'prep1' },
    { kind: 'product', productID: 'p2', preparationID: 'prep2' },
  ],
};

const sampleGroup: ProductGroupData = {
  id: 'g1',
  name: 'Breakfast Bowl',
  brand: 'Homemade',
  items: [
    { product: { id: 'p1', name: 'Oats' }, preparationID: 'prep1' },
    { product: { id: 'p2', name: 'Milk' }, preparationID: 'prep2' },
  ],
};

describe('AdminGroupEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveIndirectGroup.mockResolvedValue(sampleGroup);
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

  it('renders group name and brand', async () => {
    mockQuery({ data: sampleIndirectGroup });
    renderWithRoute('/admin/groups/g1');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Breakfast Bowl' })).toBeInTheDocument();
    });
    expect(screen.getByText('Homemade')).toBeInTheDocument();
  });

  it('renders all editor sections', async () => {
    mockQuery({ data: sampleIndirectGroup });
    renderWithRoute('/admin/groups/g1');
    await waitFor(() => {
      expect(screen.getByTestId('group-profile-form')).toBeInTheDocument();
    });
    expect(screen.getByTestId('group-items-section')).toBeInTheDocument();
    expect(screen.getByTestId('group-serving-section')).toBeInTheDocument();
    expect(screen.getByTestId('group-custom-sizes-section')).toBeInTheDocument();
    expect(screen.getByTestId('group-categories-section')).toBeInTheDocument();
    expect(screen.getByTestId('group-barcodes-section')).toBeInTheDocument();
    expect(screen.getByTestId('notes-section')).toBeInTheDocument();
    expect(screen.getByTestId('group-danger-zone')).toBeInTheDocument();
  });

  it('shows item count in items section', async () => {
    mockQuery({ data: sampleIndirectGroup });
    renderWithRoute('/admin/groups/g1');
    await waitFor(() => {
      expect(screen.getByTestId('group-items-section')).toHaveTextContent('2 items');
    });
  });

  it('does not show save/discard buttons when not dirty', async () => {
    mockQuery({ data: sampleIndirectGroup });
    renderWithRoute('/admin/groups/g1');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Breakfast Bowl' })).toBeInTheDocument();
    });
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Discard')).not.toBeInTheDocument();
  });

  it('shows save/discard buttons when draft differs from data', async () => {
    const refetch = vi.fn();
    mockUseApiQuery.mockReturnValue({
      data: sampleIndirectGroup,
      loading: false,
      error: null,
      refetch,
    } as UseApiQueryResult<IndirectGroup>);

    renderWithRoute('/admin/groups/g1');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Breakfast Bowl' })).toBeInTheDocument();
    });
  });

  it('hides brand spacer when no brand is present', async () => {
    mockResolveIndirectGroup.mockResolvedValue({ ...sampleGroup, brand: undefined });
    mockQuery({ data: { ...sampleIndirectGroup, brand: undefined } });
    renderWithRoute('/admin/groups/g1');
    await waitFor(() => {
      expect(screen.getByTestId('group-profile-form')).toBeInTheDocument();
    });
    expect(screen.queryByText('Homemade')).not.toBeInTheDocument();
  });

  it('renders resolve error state', async () => {
    mockResolveIndirectGroup.mockRejectedValue(new Error('Failed to resolve'));
    mockQuery({ data: sampleIndirectGroup });
    renderWithRoute('/admin/groups/g1');
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    expect(screen.getByText('Failed to resolve')).toBeInTheDocument();
  });
});
