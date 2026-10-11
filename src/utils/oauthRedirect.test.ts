import { describeOAuthRedirect } from './oauthRedirect';

describe('describeOAuthRedirect', () => {
  it.each([
    ['https://claude.ai/api/mcp/auth_callback?state=1', 'claude.ai'],
    ['http://localhost:33418/callback', 'localhost:33418'],
    ['http://127.0.0.1:8080/callback', '127.0.0.1:8080'],
    ['http://[::1]:9000/callback', '[::1]:9000'],
  ])('treats %s as familiar', (uri, host) => {
    expect(describeOAuthRedirect(uri)).toEqual({ host, isFamiliar: true });
  });

  it.each([
    ['another site', 'https://evil.example.com/callback', 'evil.example.com'],
    [
      'a lookalike subdomain',
      'https://claude.ai.evil.example.com/cb',
      'claude.ai.evil.example.com',
    ],
    ['a claude.ai subdomain', 'https://api.claude.ai/cb', 'api.claude.ai'],
    ['claude.ai over plain HTTP', 'http://claude.ai/cb', 'claude.ai'],
    ['a custom scheme', 'myapp://callback', 'myapp://callback'],
  ])('treats %s as unfamiliar', (_label, uri, host) => {
    expect(describeOAuthRedirect(uri)).toEqual({ host, isFamiliar: false });
  });

  it('shows the raw URI when it cannot be parsed', () => {
    expect(describeOAuthRedirect('not a url')).toEqual({ host: 'not a url', isFamiliar: false });
  });
});
