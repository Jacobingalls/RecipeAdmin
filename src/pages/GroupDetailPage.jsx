import { useParams, Link } from 'react-router-dom'
import { getGroup } from '../api'
import { useApiQuery } from '../hooks'
import { LoadingState, ErrorState, EmptyState, BackButton } from '../components/common'

export default function GroupDetailPage() {
    const { id } = useParams()
    const { data: group, loading, error } = useApiQuery(() => getGroup(id), [id])

    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error} />
    if (!group) return <EmptyState message="Group not found" />

    return (
        <>
            <BackButton to="/groups" />
            <h1 className="mb-3">{group.name}</h1>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title">Items ({group.items.length})</h5>
                    {group.items.length === 0 ? (
                        <p className="text-secondary mb-0">No items</p>
                    ) : (
                        <ul className="mb-0">
                            {group.items.map((item, i) => (
                                <li key={i}>
                                    {item.productID && (
                                        <Link to={`/products/${item.productID}`}>
                                            Product: {item.productID.slice(0, 8)}...
                                        </Link>
                                    )}
                                    {item.groupID && (
                                        <Link to={`/groups/${item.groupID}`}>
                                            Group: {item.groupID.slice(0, 8)}...
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {group.barcodes.length > 0 && (
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">Barcodes</h5>
                        <ul className="mb-0">
                            {group.barcodes.map(bc => (
                                <li key={bc.code}><code>{bc.code}</code></li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    )
}
