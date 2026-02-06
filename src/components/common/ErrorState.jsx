/**
 * Standard error message display.
 */
export default function ErrorState({ message }) {
  return <div className="text-danger">Error: {message}</div>;
}
