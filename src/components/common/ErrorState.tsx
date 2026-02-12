interface ErrorStateProps {
  message: string;
}

/**
 * Standard error message display.
 */
export default function ErrorState({ message }: ErrorStateProps) {
  return <div className="text-danger">{message}</div>;
}
