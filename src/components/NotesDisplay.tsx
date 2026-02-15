interface SourceNote {
  source: { url: string; title?: string };
}

interface TextContent {
  markdown?: string;
  text?: string;
}

interface InformationNote {
  information: TextContent;
}

interface WarningNote {
  warning: TextContent;
}

interface SevereNote {
  severe: TextContent;
}

export type Note = SourceNote | InformationNote | WarningNote | SevereNote | string;

interface NotesDisplayProps {
  notes?: Note[];
}

/**
 * A reusable component for displaying notes.
 * Handles different note types: source (url/title), information (markdown), and plain text.
 */
export default function NotesDisplay({ notes }: NotesDisplayProps) {
  if (!notes || notes.length === 0) return null;

  return (
    <ul className="list-unstyled mb-0 small text-secondary">
      {/* eslint-disable react/no-array-index-key -- Notes lack stable IDs and are never reordered */}
      {notes.map((note, index) => (
        <NoteItem key={index} note={note} />
      ))}
      {/* eslint-enable react/no-array-index-key */}
    </ul>
  );
}

interface NoteItemProps {
  note: Note;
}

function NoteItem({ note }: NoteItemProps) {
  if (typeof note === 'string') {
    return <li>{note}</li>;
  }

  // Source note: has url and optional title
  if ('source' in note) {
    const { url, title } = note.source;
    return (
      <li>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-secondary">
          {title || url}
        </a>
      </li>
    );
  }

  // Information note: has markdown content
  if ('information' in note) {
    return (
      <li>
        {note.information.markdown || note.information.text || JSON.stringify(note.information)}
      </li>
    );
  }

  // Warning note
  if ('warning' in note) {
    return (
      <li className="text-warning">
        <i className="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
        {note.warning.markdown || note.warning.text || JSON.stringify(note.warning)}
      </li>
    );
  }

  // Severe note
  if ('severe' in note) {
    return (
      <li className="text-danger" role="alert">
        <i className="bi bi-exclamation-circle-fill me-1" aria-hidden="true" />
        {note.severe.markdown || note.severe.text || JSON.stringify(note.severe)}
      </li>
    );
  }

  // Unknown format - render as JSON for debugging
  return <li className="text-muted">{JSON.stringify(note)}</li>;
}
