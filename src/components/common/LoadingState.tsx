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
    <div className="text-center py-5">
      <div className="spinner-border text-secondary" role="status">
        <span className="visually-hidden">{title}</span>
      </div>
      <h5 className="fw-semibold mt-2 text-secondary">{title}</h5>
      {description && <p className="text-secondary mb-0">{description}</p>}
    </div>
  );
}
