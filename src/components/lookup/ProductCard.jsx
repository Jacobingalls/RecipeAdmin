import { Link } from 'react-router-dom'

/**
 * Card display for a product lookup result.
 */
export default function ProductCard({ item }) {
    const p = item.product
    const prep = p.preperations.find(pr => pr.id === item.preperationID) || p.preperations[0]
    const calories = prep?.nutritionalInformation?.calories?.amount ?? '?'

    return (
        <div className="card mb-2">
            <div className="card-body">
                <span className="badge bg-secondary mb-1">Product</span>
                <h5 className="card-title mb-1">
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                </h5>
                <p className="card-text text-secondary mb-1">{p.brand}</p>
                <span className="text-primary">{calories} cal</span>
            </div>
        </div>
    )
}
