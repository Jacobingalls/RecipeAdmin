import { render, screen } from '@testing-library/react';

import * as api from '../api';

import VersionBadge from './VersionBadge';

const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getAdminVersion: vi.fn(() => null),
  };
});

describe('VersionBadge', () => {
  beforeEach(() => {
    vi.mocked(api.getAdminVersion).mockReturnValue(null);
  });

  it('returns null when apiEnvironment is null and no admin version', () => {
    mockUseAuth.mockReturnValue({ apiVersion: null, apiEnvironment: null });
    const { container } = render(<VersionBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Production environment with version', () => {
    mockUseAuth.mockReturnValue({ apiVersion: '1.2.3', apiEnvironment: 'Production' });
    render(<VersionBadge />);
    expect(screen.getByText('Production, v1.2.3')).toBeInTheDocument();
  });

  it('renders Debug environment with version', () => {
    mockUseAuth.mockReturnValue({ apiVersion: '1.0.0', apiEnvironment: 'Debug' });
    render(<VersionBadge />);
    expect(screen.getByText('Debug, v1.0.0')).toBeInTheDocument();
  });

  it('renders custom environment name', () => {
    mockUseAuth.mockReturnValue({ apiVersion: '1.0.0', apiEnvironment: 'staging' });
    render(<VersionBadge />);
    expect(screen.getByText('staging, v1.0.0')).toBeInTheDocument();
  });

  it('renders without version when version is null', () => {
    mockUseAuth.mockReturnValue({ apiVersion: null, apiEnvironment: 'Debug' });
    render(<VersionBadge />);
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });

  it('renders without version when version is empty', () => {
    mockUseAuth.mockReturnValue({ apiVersion: '', apiEnvironment: 'Debug' });
    render(<VersionBadge />);
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });

  describe('with admin version', () => {
    it('renders admin version with environment and API version', () => {
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      mockUseAuth.mockReturnValue({ apiVersion: '0.0.27', apiEnvironment: 'Production' });
      render(<VersionBadge />);
      const el = screen.getByText(/v0\.0\.28/);
      expect(el).toHaveTextContent('Production, v0.0.28 (API v0.0.27)');
    });

    it('renders admin version without API version', () => {
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      mockUseAuth.mockReturnValue({ apiVersion: null, apiEnvironment: 'Production' });
      render(<VersionBadge />);
      expect(screen.getByText('Production, v0.0.28')).toBeInTheDocument();
    });

    it('renders admin version without environment', () => {
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      mockUseAuth.mockReturnValue({ apiVersion: '0.0.27', apiEnvironment: null });
      render(<VersionBadge />);
      const el = screen.getByText(/v0\.0\.28/);
      expect(el).toHaveTextContent('v0.0.28 (API v0.0.27)');
    });

    it('renders admin version alone when no environment or API version', () => {
      vi.mocked(api.getAdminVersion).mockReturnValue('0.0.28');
      mockUseAuth.mockReturnValue({ apiVersion: null, apiEnvironment: null });
      render(<VersionBadge />);
      expect(screen.getByText('v0.0.28')).toBeInTheDocument();
    });
  });
});
