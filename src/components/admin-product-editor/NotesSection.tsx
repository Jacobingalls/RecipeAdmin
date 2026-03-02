import { useState } from 'react';

import type { Note } from '../NotesDisplay';
import {
  SectionHeader,
  Button,
  CircularButton,
  CircularButtonGroup,
  DeleteButton,
  NoteContent,
} from '../common';

import NoteModal from './NoteModal';

/** Preset note template that can be added with a single click. */
export interface NoteShortcut {
  label: string;
  icon?: string;
  note: Note;
}

interface NotesSectionProps {
  notes: Note[];
  onChange: (notes: Note[]) => void;
  className?: string;
  shortcuts?: NoteShortcut[];
  /** "section" uses SectionHeader + list-group; "card" uses a Bootstrap card. */
  variant?: 'section' | 'card';
}

function NoteRow({
  note,
  index,
  onEdit,
  onRemove,
}: {
  note: Note;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="list-group-item d-flex align-items-center gap-2">
      <div className="flex-grow-1 small">
        <NoteContent note={note} />
      </div>
      <CircularButtonGroup>
        <CircularButton aria-label={`Edit note ${index + 1}`} onClick={onEdit}>
          <i className="bi bi-pencil" aria-hidden="true" />
        </CircularButton>
        <DeleteButton ariaLabel={`Remove note ${index + 1}`} onClick={onRemove} />
      </CircularButtonGroup>
    </div>
  );
}

export default function NotesSection({
  notes,
  onChange,
  className,
  variant = 'section',
}: NotesSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function handleAdd(note: Note) {
    setShowAddModal(false);
    onChange([...notes, note]);
  }

  function handleEdit(index: number, note: Note) {
    setEditIndex(null);
    onChange(notes.map((n, i) => (i === index ? note : n)));
  }

  function handleRemove(index: number) {
    onChange(notes.filter((_, i) => i !== index));
  }

  /* eslint-disable react/no-array-index-key -- Notes lack stable IDs and are never reordered */
  const noteRows = notes.map((note, index) => (
    <NoteRow
      key={index}
      note={note}
      index={index}
      onEdit={() => setEditIndex(index)}
      onRemove={() => handleRemove(index)}
    />
  ));
  /* eslint-enable react/no-array-index-key */

  const modals = (
    <>
      {showAddModal && <NoteModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      {editIndex != null && (
        <NoteModal
          note={notes[editIndex]}
          onSave={(n) => handleEdit(editIndex, n)}
          onClose={() => setEditIndex(null)}
        />
      )}
    </>
  );

  if (variant === 'card') {
    return (
      <div className={className}>
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>Notes</strong>
            <Button size="sm" variant="dark" onClick={() => setShowAddModal(true)}>
              Add
            </Button>
          </div>
          {notes.length > 0 ? (
            <div className="list-group list-group-flush">{noteRows}</div>
          ) : (
            <div className="card-body">
              <p className="text-body-secondary small mb-0">No notes</p>
            </div>
          )}
        </div>
        {modals}
      </div>
    );
  }

  return (
    <div className={className}>
      <SectionHeader title="Notes">
        <Button size="sm" variant="dark" onClick={() => setShowAddModal(true)}>
          Add
        </Button>
      </SectionHeader>
      {notes.length > 0 ? (
        <div className="list-group">{noteRows}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-body-secondary small mb-0">No notes</p>
          </div>
        </div>
      )}
      {modals}
    </div>
  );
}
