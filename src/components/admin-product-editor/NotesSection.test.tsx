import { render, screen, fireEvent } from '@testing-library/react';

import type { Note } from '../NotesDisplay';

import NotesSection from './NotesSection';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const onChange = vi.fn();

const sampleNotes: Note[] = [
  { information: { markdown: 'Some info' } },
  { warning: { markdown: 'Be careful' } },
  { source: { url: 'https://example.com', title: 'Example' } },
];

function renderSection(notes: Note[] = sampleNotes) {
  return render(<NotesSection notes={notes} onChange={onChange} />);
}

describe('NotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Empty state ---

  it('shows empty state when no notes', () => {
    renderSection([]);
    expect(screen.getByText('No notes')).toBeInTheDocument();
  });

  it('shows section header with Add button', () => {
    renderSection([]);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  // --- Display ---

  it('renders information note content', () => {
    renderSection();
    expect(screen.getByText('Some info')).toBeInTheDocument();
  });

  it('renders warning note with warning icon', () => {
    renderSection();
    const text = screen.getByText('Be careful');
    const icon = text.parentElement!.querySelector('i');
    expect(icon).toHaveClass('text-warning');
  });

  it('renders source note as link', () => {
    renderSection();
    const link = screen.getByRole('link', { name: 'Example' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders severe note with danger icon', () => {
    renderSection([{ severe: { markdown: 'Critical' } }]);
    const text = screen.getByText('Critical');
    const icon = text.parentElement!.querySelector('i');
    expect(icon).toHaveClass('text-danger');
  });

  it('renders plain string note', () => {
    renderSection(['Plain text']);
    expect(screen.getByText('Plain text')).toBeInTheDocument();
  });

  it('renders edit and remove buttons for each note', () => {
    renderSection();
    expect(screen.getByLabelText('Edit note 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove note 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit note 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove note 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit note 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove note 3')).toBeInTheDocument();
  });

  // --- Remove ---

  it('calls onChange when a note is removed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Remove note 1'));
    expect(onChange).toHaveBeenCalledWith([sampleNotes[1], sampleNotes[2]]);
  });

  it('removes the correct note by index', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Remove note 2'));
    expect(onChange).toHaveBeenCalledWith([sampleNotes[0], sampleNotes[2]]);
  });

  // --- Add modal ---

  it('opens add modal when Add is clicked', () => {
    renderSection([]);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add note')).toBeInTheDocument();
  });

  it('adds a new note via the modal', () => {
    renderSection([]);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'New note' } });
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-primary')!);

    expect(onChange).toHaveBeenCalledWith([{ information: { markdown: 'New note' } }]);
  });

  it('closes add modal on Cancel', () => {
    renderSection([]);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // --- Edit modal ---

  it('opens edit modal pre-populated when edit is clicked', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Edit note 1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit note')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toHaveValue('Some info');
  });

  it('saves edited note via the modal', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Edit note 1'));

    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Updated info' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onChange).toHaveBeenCalledWith([
      { information: { markdown: 'Updated info' } },
      sampleNotes[1],
      sampleNotes[2],
    ]);
  });

  it('closes edit modal on Cancel', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Edit note 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // --- className ---

  it('applies className to root element', () => {
    const { container } = render(<NotesSection notes={[]} onChange={onChange} className="mt-5" />);
    expect(container.firstElementChild).toHaveClass('mt-5');
  });

  // --- card variant ---

  it('renders card header in card variant', () => {
    const { container } = render(
      <NotesSection notes={sampleNotes} onChange={onChange} variant="card" />,
    );
    const header = container.querySelector('.card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Notes');
  });

  it('renders notes in list-group-flush in card variant', () => {
    const { container } = render(
      <NotesSection notes={sampleNotes} onChange={onChange} variant="card" />,
    );
    expect(container.querySelector('.list-group-flush')).toBeInTheDocument();
  });

  it('renders empty state in card-body in card variant', () => {
    const { container } = render(<NotesSection notes={[]} onChange={onChange} variant="card" />);
    const body = container.querySelector('.card-body');
    expect(body).toBeInTheDocument();
    expect(body).toHaveTextContent('No notes');
  });

  it('supports add/remove in card variant', () => {
    render(<NotesSection notes={sampleNotes} onChange={onChange} variant="card" />);
    fireEvent.click(screen.getByLabelText('Remove note 1'));
    expect(onChange).toHaveBeenCalledWith([sampleNotes[1], sampleNotes[2]]);
  });
});
