/**
 * Standard empty state display when no items are found.
 */
export default function EmptyState({ message = 'No items found' }) {
    return <div className="text-secondary">{message}</div>
}
