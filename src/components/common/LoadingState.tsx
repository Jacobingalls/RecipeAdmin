interface LoadingStateProps {
  message?: string;
}

/**
 * Standard loading indicator for async operations.
 */
export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return <div className="text-secondary fst-italic">{message}</div>;
}
