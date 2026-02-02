import ProductCard from './ProductCard'
import GroupCard from './GroupCard'

/**
 * Renders a lookup result item, dispatching to ProductCard or GroupCard.
 */
export default function LookupResultItem({ item, barcode }) {
    if (item.product) {
        return <ProductCard item={item} barcode={barcode} />
    } else if (item.group) {
        return <GroupCard item={item} barcode={barcode} />
    }
    return null
}
