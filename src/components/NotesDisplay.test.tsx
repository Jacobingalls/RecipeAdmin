import { render, screen } from '@testing-library/react';

import type { Note } from './NotesDisplay';
import NotesDisplay from './NotesDisplay';

describe('NotesDisplay', () => {
  it('returns null when notes is undefined', () => {
    const { container } = render(<NotesDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when notes is empty', () => {
    const { container } = render(<NotesDisplay notes={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders string notes', () => {
    render(<NotesDisplay notes={['Plain text note']} />);
    expect(screen.getByText('Plain text note')).toBeInTheDocument();
  });

  it('renders source notes with title', () => {
    const notes: Note[] = [{ source: { url: 'https://example.com', title: 'Example' } }];
    render(<NotesDisplay notes={notes} />);
    const link = screen.getByRole('link', { name: 'Example' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders source notes with url as fallback text', () => {
    const notes: Note[] = [{ source: { url: 'https://example.com' } }];
    render(<NotesDisplay notes={notes} />);
    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders information notes with markdown', () => {
    const notes: Note[] = [{ information: { markdown: 'Some info' } }];
    render(<NotesDisplay notes={notes} />);
    expect(screen.getByText('Some info')).toBeInTheDocument();
  });

  it('renders information notes with text fallback', () => {
    const notes: Note[] = [{ information: { text: 'Info text' } }];
    render(<NotesDisplay notes={notes} />);
    expect(screen.getByText('Info text')).toBeInTheDocument();
  });

  it('renders information notes as JSON when no markdown or text', () => {
    const notes: Note[] = [{ information: {} }];
    render(<NotesDisplay notes={notes} />);
    expect(screen.getByText('{}')).toBeInTheDocument();
  });

  it('renders warning notes with warning style', () => {
    const notes: Note[] = [{ warning: { markdown: 'Be careful' } }];
    render(<NotesDisplay notes={notes} />);
    const item = screen.getByText('Be careful');
    expect(item.closest('li')?.className).toContain('text-warning');
  });

  it('renders warning notes with text fallback', () => {
    const notes: Note[] = [{ warning: { text: 'Warning text' } }];
    render(<NotesDisplay notes={notes} />);
    expect(screen.getByText('Warning text')).toBeInTheDocument();
  });

  it('renders severe notes with danger style', () => {
    const notes: Note[] = [{ severe: { markdown: 'Critical issue' } }];
    render(<NotesDisplay notes={notes} />);
    const item = screen.getByText('Critical issue');
    expect(item.closest('li')?.className).toContain('text-danger');
  });

  it('renders severe notes with text fallback', () => {
    const notes: Note[] = [{ severe: { text: 'Severe text' } }];
    render(<NotesDisplay notes={notes} />);
    expect(screen.getByText('Severe text')).toBeInTheDocument();
  });

  it('renders multiple mixed notes', () => {
    const notes: Note[] = [
      'Plain text',
      { source: { url: 'https://example.com', title: 'Link' } },
      { information: { markdown: 'Info' } },
    ];
    render(<NotesDisplay notes={notes} />);
    expect(screen.getByText('Plain text')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});
