import { useParams } from 'react-router-dom'
import { lookupBarcode } from '../api'
import { useApiQuery } from '../hooks'
import { LoadingState, ErrorState, EmptyState } from '../components/common'
import { LookupResultItem } from '../components/lookup'

export default function LookupPage() {
    const { barcode } = useParams()
    const { data: results, loading, error } = useApiQuery(
        () => lookupBarcode(barcode),
        [barcode],
        { enabled: !!barcode }
    )

    return (
        <>
            <h1 className="mb-4">Lookup</h1>
            {!barcode && (
                <div className="text-secondary">Enter a barcode in the search box above</div>
            )}
            {barcode && (
                <p className="text-secondary mb-3">
                    Results for: <code>{barcode}</code>
                </p>
            )}

            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}
            {results && results.length === 0 && (
                <EmptyState message="No results found" />
            )}
            {results && results.length > 0 && (
                <div>
                    {results.map((item, i) => <LookupResultItem key={i} item={item} barcode={barcode} />)}
                </div>
            )}
        </>
    )
}
