interface EmptyStateProps {
  message?: string;
}

/**
 * Standard empty state display when no items are found.
 */
export default function EmptyState({ message = 'No items found' }: EmptyStateProps) {
  return <div className="text-secondary">{message}</div>;
}
