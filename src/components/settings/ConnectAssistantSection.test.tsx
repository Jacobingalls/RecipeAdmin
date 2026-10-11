import { act, fireEvent, render, screen } from '@testing-library/react';

import { useAuth } from '../../contexts/AuthContext';

import ConnectAssistantSection from './ConnectAssistantSection';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockWriteText = vi.fn().mockResolvedValue(undefined);

const mcpURL = 'https://recipe-api.example.com/mcp';
const command = `claude mcp add --transport http recipe ${mcpURL} --header "Authorization: Bearer <API key>"`;

function renderWithMcpURL(url: string | null) {
  mockUseAuth.mockReturnValue({ mcpURL: url } as ReturnType<typeof useAuth>);
  return render(<ConnectAssistantSection />);
}

describe('ConnectAssistantSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
  });

  it('renders nothing when the server has no MCP URL', () => {
    const { container } = renderWithMcpURL(null);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the MCP URL and the Claude Code command', () => {
    renderWithMcpURL(mcpURL);
    expect(screen.getByRole('heading', { name: 'Connect an AI assistant' })).toBeInTheDocument();
    expect(screen.getByLabelText('MCP server URL')).toHaveValue(mcpURL);
    expect(screen.getByText(command)).toBeInTheDocument();
  });

  it('explains how to connect Claude and where to find connected apps', () => {
    renderWithMcpURL(mcpURL);
    expect(screen.getByText(/add a custom connector with this URL/)).toBeInTheDocument();
    expect(
      screen.getByText(/replacing <API key> with a key you create under Credentials above/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Connected apps appear under Sessions/)).toBeInTheDocument();
  });

  it.each([
    ['Copy URL', mcpURL],
    ['Copy command', command],
  ])('%s copies it to the clipboard', async (label, text) => {
    renderWithMcpURL(mcpURL);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: label }));
    });
    expect(mockWriteText).toHaveBeenCalledWith(text);
  });
});
