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
      symbol={<i className="spinner-border fs-1 text-secondary" style={{ borderWidth: '0.1em' }} />}
      title={title}
      description={description}
    />
  );
}
