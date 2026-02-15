import { render, screen } from '@testing-library/react';

import VersionBadge from './VersionBadge';

const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

describe('VersionBadge', () => {
  it('returns null when apiEnvironment is null', () => {
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
});
