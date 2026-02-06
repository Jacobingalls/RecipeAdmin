import { Link } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label?: string;
}

/**
 * Standard back navigation button.
 */
export default function BackButton({ to, label = 'Back' }: BackButtonProps) {
  return (
    <Link to={to} className="btn btn-outline-secondary btn-sm mb-3">
      &larr; {label}
    </Link>
  );
}
