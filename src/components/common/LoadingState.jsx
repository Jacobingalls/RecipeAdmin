/**
 * Standard loading indicator for async operations.
 */
export default function LoadingState({ message = 'Loading...' }) {
  return <div className="text-secondary fst-italic">{message}</div>;
}
