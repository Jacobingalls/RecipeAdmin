import { render, screen, fireEvent } from '@testing-library/react';

import type { Note } from '../NotesDisplay';

import NoteModal from './NoteModal';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const onSave = vi.fn();
const onClose = vi.fn();

function renderModal(note?: Note) {
  return render(<NoteModal note={note} onSave={onSave} onClose={onClose} />);
}

describe('NoteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Add mode ---

  it('renders "Add note" title when no note prop', () => {
    renderModal();
    expect(screen.getByText('Add note')).toBeInTheDocument();
  });

  it('defaults type to Information', () => {
    renderModal();
    expect(screen.getByLabelText('Type')).toHaveValue('information');
  });

  it('shows content textarea for text note types', () => {
    renderModal();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });

  it('disables Add button when content is empty', () => {
    renderModal();
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toBeDisabled();
  });

  it('enables Add button when content is filled', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Some info' } });
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).not.toBeDisabled();
  });

  it('saves information note on submit', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Test info' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSave).toHaveBeenCalledWith({ information: { markdown: 'Test info' } });
  });

  it('saves warning note on submit', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'warning' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Be careful' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSave).toHaveBeenCalledWith({ warning: { markdown: 'Be careful' } });
  });

  it('saves severe note on submit', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'severe' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Critical' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSave).toHaveBeenCalledWith({ severe: { markdown: 'Critical' } });
  });

  // --- Source type ---

  it('shows URL and Title fields when type is Source', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'source' } });
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.queryByLabelText('Content')).not.toBeInTheDocument();
  });

  it('disables Add when source URL is empty', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'source' } });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('saves source note with title', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'source' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'USDA' } });
    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://fdc.nal.usda.gov' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSave).toHaveBeenCalledWith({
      source: { url: 'https://fdc.nal.usda.gov', title: 'USDA' },
    });
  });

  it('saves source note without title when title is blank', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'source' } });
    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSave).toHaveBeenCalledWith({ source: { url: 'https://example.com' } });
  });

  // --- Edit mode ---

  it('renders "Edit note" title when note prop is provided', () => {
    renderModal({ information: { markdown: 'Existing' } });
    expect(screen.getByText('Edit note')).toBeInTheDocument();
  });

  it('shows Save button in edit mode', () => {
    renderModal({ information: { markdown: 'Existing' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('pre-populates information note fields', () => {
    renderModal({ information: { markdown: 'Existing info' } });
    expect(screen.getByLabelText('Type')).toHaveValue('information');
    expect(screen.getByLabelText('Content')).toHaveValue('Existing info');
  });

  it('pre-populates warning note fields', () => {
    renderModal({ warning: { markdown: 'Watch out' } });
    expect(screen.getByLabelText('Type')).toHaveValue('warning');
    expect(screen.getByLabelText('Content')).toHaveValue('Watch out');
  });

  it('pre-populates severe note fields', () => {
    renderModal({ severe: { markdown: 'Danger' } });
    expect(screen.getByLabelText('Type')).toHaveValue('severe');
    expect(screen.getByLabelText('Content')).toHaveValue('Danger');
  });

  it('pre-populates source note fields', () => {
    renderModal({ source: { url: 'https://example.com', title: 'Example' } });
    expect(screen.getByLabelText('Type')).toHaveValue('source');
    expect(screen.getByLabelText('URL')).toHaveValue('https://example.com');
    expect(screen.getByLabelText('Title')).toHaveValue('Example');
  });

  it('pre-populates plain string note as information', () => {
    renderModal('plain text note');
    expect(screen.getByLabelText('Type')).toHaveValue('information');
    expect(screen.getByLabelText('Content')).toHaveValue('plain text note');
  });

  it('pre-populates information note with text fallback', () => {
    renderModal({ information: { text: 'Fallback text' } });
    expect(screen.getByLabelText('Content')).toHaveValue('Fallback text');
  });

  // --- Cancel ---

  it('calls onClose when Cancel is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('trims whitespace from content on save', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: '  trimmed  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSave).toHaveBeenCalledWith({ information: { markdown: 'trimmed' } });
  });
});
