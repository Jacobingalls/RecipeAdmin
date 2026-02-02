import { Link } from 'react-router-dom'

/**
 * Standard back navigation button.
 */
export default function BackButton({ to, label = 'Back' }) {
    return (
        <Link to={to} className="btn btn-outline-secondary btn-sm mb-3">
            &larr; {label}
        </Link>
    )
}
