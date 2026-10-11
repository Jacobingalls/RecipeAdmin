import { render, screen } from '@testing-library/react';

import type { AuthUser, OAuthAuthorizationDescription } from '../../api';

import OAuthConsentSummary from './OAuthConsentSummary';

const user: AuthUser = {
  id: '1',
  username: 'jacob',
  displayName: 'Jacob Ingalls',
  email: 'jacob@example.com',
  isAdmin: false,
  hasPasskeys: true,
};

function makeDescription(
  overrides: Partial<OAuthAuthorizationDescription> = {},
): OAuthAuthorizationDescription {
  return {
    clientID: 'client-123',
    clientName: 'Claude',
    redirectURI: 'https://claude.ai/api/mcp/auth_callback',
    scopes: [
      { name: 'recipes:read', description: 'View your products and recipes' },
      { name: 'logs:write', description: 'Log food for you' },
    ],
    ...overrides,
  };
}

describe('OAuthConsentSummary', () => {
  it('names the client prominently and shows its ID', () => {
    render(<OAuthConsentSummary description={makeDescription()} user={user} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Claude' })).toBeInTheDocument();
    expect(screen.getByText('wants to access your Recipe account')).toBeInTheDocument();
    expect(screen.getByText('client-123')).toBeInTheDocument();
  });

  it('shows which account is granting access', () => {
    render(<OAuthConsentSummary description={makeDescription()} user={user} />);
    expect(screen.getByText('Jacob Ingalls')).toBeInTheDocument();
    expect(screen.getByText('jacob')).toBeInTheDocument();
  });

  it('falls back to the username when there is no display name', () => {
    render(
      <OAuthConsentSummary description={makeDescription()} user={{ ...user, displayName: '' }} />,
    );
    expect(screen.getByText('jacob')).toBeInTheDocument();
    expect(screen.queryByText('Jacob Ingalls')).not.toBeInTheDocument();
  });

  it('lists each requested scope with its description', () => {
    render(<OAuthConsentSummary description={makeDescription()} user={user} />);
    const list = screen.getByRole('region', { name: 'Requested access' });
    expect(list).toHaveTextContent('View your products and recipes');
    expect(list).toHaveTextContent('recipes:read');
    expect(list).toHaveTextContent('Log food for you');
    expect(list).toHaveTextContent('logs:write');
  });

  it('omits the scope list when no scopes are requested', () => {
    render(<OAuthConsentSummary description={makeDescription({ scopes: [] })} user={user} />);
    expect(screen.queryByRole('region', { name: 'Requested access' })).not.toBeInTheDocument();
  });

  it.each([
    ['claude.ai', 'https://claude.ai/api/mcp/auth_callback', 'claude.ai'],
    ['localhost', 'http://localhost:33418/callback', 'localhost:33418'],
    ['127.0.0.1', 'http://127.0.0.1:5000/callback', '127.0.0.1:5000'],
  ])('shows the %s redirect host without a warning', (_label, redirectURI, host) => {
    render(<OAuthConsentSummary description={makeDescription({ redirectURI })} user={user} />);
    expect(screen.getByText(host)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('warns when the redirect host is neither Claude nor this device', () => {
    render(
      <OAuthConsentSummary
        description={makeDescription({ redirectURI: 'https://evil.example.com/cb?x=1' })}
        user={user}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      "evil.example.com isn't Claude or an app on this device.",
    );
  });
});
