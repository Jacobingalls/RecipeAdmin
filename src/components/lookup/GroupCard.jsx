import { Link } from 'react-router-dom'
import LookupResultItem from './LookupResultItem'

/**
 * Card display for a group lookup result.
 * Recursively renders nested items.
 */
export default function GroupCard({ item }) {
    const g = item.group

    return (
        <div className="card mb-2">
            <div className="card-body">
                <span className="badge bg-info mb-1">Group</span>
                <h5 className="card-title mb-1">
                    <Link to={`/groups/${g.id}`}>{g.name}</Link>
                </h5>
                <span className="text-secondary">{g.items.length} item(s)</span>
                {g.items.length > 0 && (
                    <div className="ms-4 ps-3 border-start mt-2">
                        {g.items.map((nested, i) => <LookupResultItem key={i} item={nested} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
