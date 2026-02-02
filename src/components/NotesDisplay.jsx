/**
 * A reusable component for displaying notes.
 * Handles different note types: source (url/title), information (markdown), and plain text.
 */
export default function NotesDisplay({ notes }) {
    if (!notes || notes.length === 0) return null

    return (
        <ul className="list-unstyled mb-0 small text-secondary">
            {notes.map((note, index) => (
                <NoteItem key={index} note={note} />
            ))}
        </ul>
    )
}

function NoteItem({ note }) {
    // Source note: has url and optional title
    if (note.source) {
        const { url, title } = note.source
        return (
            <li>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-secondary">
                    {title || url}
                </a>
            </li>
        )
    }

    // Information note: has markdown content
    if (note.information) {
        return (
            <li>{note.information.markdown || note.information.text || JSON.stringify(note.information)}</li>
        )
    }

    // Plain text note
    if (typeof note === 'string') {
        return <li>{note}</li>
    }

    // Unknown format - render as JSON for debugging
    return <li className="text-muted">{JSON.stringify(note)}</li>
}
