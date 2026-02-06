import { render, screen } from '@testing-library/react';

import type { UseApiQueryResult } from '../hooks/useApiQuery';
import type { ApiVersion } from '../api';

import VersionBadge from './VersionBadge';

const mockUseApiQuery = vi.fn<() => UseApiQueryResult<ApiVersion>>();

vi.mock('../hooks', () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

vi.mock('../api', () => ({
  getVersion: vi.fn(),
}));

describe('VersionBadge', () => {
  it('returns null while loading', () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<VersionBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error state when fetch fails', () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      refetch: vi.fn(),
    });

    render(<VersionBadge />);
    expect(screen.getByText('Error loading version')).toBeInTheDocument();
  });

  it('renders error state when data is null', () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<VersionBadge />);
    expect(screen.getByText('Error loading version')).toBeInTheDocument();
  });

  it('renders Production environment when debug is false', () => {
    mockUseApiQuery.mockReturnValue({
      data: { version: '1.2.3', debug: false },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<VersionBadge />);
    expect(screen.getByText('Production, v1.2.3')).toBeInTheDocument();
  });

  it('renders Debug environment when debug is true', () => {
    mockUseApiQuery.mockReturnValue({
      data: { version: '1.0.0', debug: true },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<VersionBadge />);
    expect(screen.getByText('Debug, v1.0.0')).toBeInTheDocument();
  });

  it('renders without version when version is empty', () => {
    mockUseApiQuery.mockReturnValue({
      data: { version: '', debug: true },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<VersionBadge />);
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });
});
