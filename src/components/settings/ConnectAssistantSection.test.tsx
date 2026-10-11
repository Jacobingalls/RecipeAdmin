import { act, fireEvent, render, screen } from '@testing-library/react';

import { MCP_URL } from '../../api';

import ConnectAssistantSection from './ConnectAssistantSection';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

const command = `claude mcp add --transport http recipe ${MCP_URL} --header "Authorization: Bearer <API key>"`;

describe('ConnectAssistantSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
  });

  it('shows the MCP URL and the Claude Code command', () => {
    render(<ConnectAssistantSection />);
    expect(screen.getByRole('heading', { name: 'Connect an AI assistant' })).toBeInTheDocument();
    expect(screen.getByLabelText('MCP server URL')).toHaveValue(MCP_URL);
    expect(screen.getByText(command)).toBeInTheDocument();
  });

  it('explains how to connect Claude and where to find connected apps', () => {
    render(<ConnectAssistantSection />);
    expect(screen.getByText(/add a custom connector with this URL/)).toBeInTheDocument();
    expect(
      screen.getByText(/replacing <API key> with a key you create under Credentials above/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Connected apps appear under Sessions/)).toBeInTheDocument();
  });

  it.each([
    ['Copy URL', MCP_URL],
    ['Copy command', command],
  ])('%s copies it to the clipboard', async (label, text) => {
    render(<ConnectAssistantSection />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: label }));
    });
    expect(mockWriteText).toHaveBeenCalledWith(text);
  });
});
