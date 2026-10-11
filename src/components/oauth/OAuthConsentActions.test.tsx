import { act, fireEvent, render, screen } from '@testing-library/react';

import { oauthDecideAuthorization } from '../../api';

import OAuthConsentActions from './OAuthConsentActions';

vi.mock('../../api', () => ({
  oauthDecideAuthorization: vi.fn(),
}));

const mockDecide = vi.mocked(oauthDecideAuthorization);
const mockAssign = vi.fn();

describe('OAuthConsentActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { ...window.location, assign: mockAssign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['Allow', true, 'https://claude.ai/api/mcp/auth_callback?code=abc&state=s'],
    ['Deny', false, 'http://localhost:33418/callback?error=access_denied'],
  ])('sends %s and follows the redirect', async (label, approve, redirectTo) => {
    mockDecide.mockResolvedValue({ redirectTo });
    render(<OAuthConsentActions request="signed-token" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: label }));
    });

    expect(mockDecide).toHaveBeenCalledWith('signed-token', approve);
    expect(mockAssign).toHaveBeenCalledWith(redirectTo);
  });

  it('disables both buttons while a decision is in flight', async () => {
    let resolve: (value: { redirectTo: string }) => void = () => {};
    mockDecide.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<OAuthConsentActions request="signed-token" />);

    fireEvent.click(screen.getByRole('button', { name: 'Allow' }));

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toBeDisabled());

    await act(async () => {
      resolve({ redirectTo: 'https://claude.ai/cb' });
    });
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });

  it('shows an error and re-enables the buttons when the decision fails', async () => {
    mockDecide.mockRejectedValue(new Error('HTTP 403'));
    render(<OAuthConsentActions request="signed-token" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't send your decision. Try again.");
    expect(mockAssign).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Allow' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Deny' })).toBeEnabled();
  });

  it('clears the previous error when trying again', async () => {
    mockDecide.mockRejectedValueOnce(new Error('HTTP 500'));
    mockDecide.mockResolvedValueOnce({ redirectTo: 'https://claude.ai/cb' });
    render(<OAuthConsentActions request="signed-token" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Allow' }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Allow' }));
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockAssign).toHaveBeenCalledWith('https://claude.ai/cb');
  });
});
