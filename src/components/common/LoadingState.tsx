import StatusView from './StatusView';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

/**
 * Centered loading indicator with spinner, title, and optional description.
 * Mirrors the layout of ContentUnavailableView for visual consistency.
 */
export default function LoadingState({ title = 'Loading...', description }: LoadingStateProps) {
  return (
    <StatusView
      symbol={
        <span
          className="spinner-border fs-1 text-secondary"
          role="status"
          style={{ borderWidth: '0.1em' }}
        >
          <span className="visually-hidden">Loading...</span>
        </span>
      }
      title={title}
      description={description}
    />
  );
}
