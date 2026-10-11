import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { AuthUser } from '../api';
import { ApiError, oauthDecideAuthorization, oauthDescribeAuthorization } from '../api';
import { useAuth } from '../contexts/AuthContext';

import OAuthConsentPage from './OAuthConsentPage';

vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  oauthDescribeAuthorization: vi.fn(),
  oauthDecideAuthorization: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockDescribe = vi.mocked(oauthDescribeAuthorization);
const mockDecide = vi.mocked(oauthDecideAuthorization);
const mockAssign = vi.fn();

const user: AuthUser = {
  id: '1',
  username: 'jacob',
  displayName: 'Jacob Ingalls',
  email: 'jacob@example.com',
  isAdmin: false,
  hasPasskeys: true,
};

const description = {
  clientID: 'client-123',
  clientName: 'Claude',
  redirectURI: 'https://claude.ai/api/mcp/auth_callback',
  scopes: [{ name: 'recipes:read', description: 'View your products and recipes' }],
};

async function renderPage(path = '/oauth/consent?request=signed-token') {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <OAuthConsentPage />
      </MemoryRouter>,
    );
  });
}

describe('OAuthConsentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>);
    vi.stubGlobal('location', { ...window.location, assign: mockAssign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('describes the request from the query string', async () => {
    mockDescribe.mockResolvedValue(description);
    await renderPage();

    expect(mockDescribe).toHaveBeenCalledWith('signed-token');
    expect(screen.getByRole('heading', { level: 1, name: 'Claude' })).toBeInTheDocument();
    expect(screen.getByText('client-123')).toBeInTheDocument();
    expect(screen.getByText('claude.ai')).toBeInTheDocument();
    expect(screen.getByText('View your products and recipes')).toBeInTheDocument();
    expect(screen.getByText('Jacob Ingalls')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a loading state while describing', async () => {
    mockDescribe.mockReturnValue(new Promise(() => {}));
    await renderPage();
    expect(screen.queryByRole('button', { name: 'Allow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('warns about an unfamiliar redirect host', async () => {
    mockDescribe.mockResolvedValue({
      ...description,
      redirectURI: 'https://evil.example.com/callback',
    });
    await renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent(
      "evil.example.com isn't Claude or an app on this device.",
    );
  });

  it.each([
    ['Allow', true],
    ['Deny', false],
  ])('sends %s with the request token and follows the redirect', async (label, approve) => {
    mockDescribe.mockResolvedValue(description);
    mockDecide.mockResolvedValue({ redirectTo: 'https://claude.ai/cb?code=abc' });
    await renderPage();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: label }));
    });

    expect(mockDecide).toHaveBeenCalledWith('signed-token', approve);
    expect(mockAssign).toHaveBeenCalledWith('https://claude.ai/cb?code=abc');
  });

  it('explains a missing request without calling the API', async () => {
    await renderPage('/oauth/consent');
    expect(screen.getByRole('alert')).toHaveTextContent('This link is incomplete');
    expect(mockDescribe).not.toHaveBeenCalled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it("shows the server's reason when the request can't be described", async () => {
    mockDescribe.mockRejectedValue(new ApiError(400, 'Authorization request expired'));
    await renderPage();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load this request");
    expect(alert).toHaveTextContent('Authorization request expired');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([
    ['an API error without a reason', new ApiError(500, null)],
    ['a network error', new TypeError('Failed to fetch')],
  ])('shows a generic explanation for %s', async (_label, error) => {
    mockDescribe.mockRejectedValue(error);
    await renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'It may have expired. Go back to the app that sent you here and connect again.',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
