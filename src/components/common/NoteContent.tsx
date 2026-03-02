import Markdown from 'react-markdown';

import type { Note } from '../NotesDisplay';

function getNoteText(note: Note): string {
  if (typeof note === 'string') {
    return note;
  }
  if ('information' in note) {
    return note.information.markdown || note.information.text || JSON.stringify(note.information);
  }
  if ('warning' in note) {
    return note.warning.markdown || note.warning.text || JSON.stringify(note.warning);
  }
  if ('severe' in note) {
    return note.severe.markdown || note.severe.text || JSON.stringify(note.severe);
  }
  return JSON.stringify(note);
}

function getNoteIcon(note: Note) {
  if (typeof note !== 'string' && 'warning' in note) {
    return <i className="bi bi-exclamation-triangle-fill me-1 text-warning" aria-hidden="true" />;
  }
  if (typeof note !== 'string' && 'severe' in note) {
    return <i className="bi bi-exclamation-circle-fill me-1 text-danger" aria-hidden="true" />;
  }
  return null;
}

interface NoteContentProps {
  note: Note;
}

/**
 * Renders the content of a single note: markdown text, source links,
 * or warning/severe notes with a colored icon.
 */
export default function NoteContent({ note }: NoteContentProps) {
  if (typeof note !== 'string' && 'source' in note) {
    const { url, title } = note.source;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title || url}
      </a>
    );
  }

  return (
    <>
      {getNoteIcon(note)}
      <Markdown
        components={{
          // Render inline — unwrap the outer <p> that react-markdown adds
          p: ({ children }) => <>{children}</>,
        }}
      >
        {getNoteText(note)}
      </Markdown>
    </>
  );
}
