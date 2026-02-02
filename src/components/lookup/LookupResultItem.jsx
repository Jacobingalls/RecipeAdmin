import ProductCard from './ProductCard'
import GroupCard from './GroupCard'

/**
 * Renders a lookup result item, dispatching to ProductCard or GroupCard.
 */
export default function LookupResultItem({ item }) {
    if (item.product) {
        return <ProductCard item={item} />
    } else if (item.group) {
        return <GroupCard item={item} />
    }
    return null
}
