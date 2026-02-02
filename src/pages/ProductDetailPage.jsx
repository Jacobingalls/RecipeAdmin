import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../api'
import { useApiQuery } from '../hooks'
import { ServingSize } from '../domain'
import { LoadingState, ErrorState, EmptyState, BackButton } from '../components/common'
import { PreparationDetails } from '../components/product'
import BarcodeSection from '../components/BarcodeSection'

export default function ProductDetailPage() {
    const { id } = useParams()
    const { data: product, loading, error } = useApiQuery(() => getProduct(id), [id])
    const [activePrep, setActivePrep] = useState(null)
    const [servingSize, setServingSize] = useState(() => ServingSize.servings(1))

    useEffect(() => {
        if (product) {
            setActivePrep(product.defaultPreperationID || product.preperations[0]?.id)
        }
    }, [product])

    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error} />
    if (!product) return <EmptyState message="Product not found" />

    const currentPrep = product.preperations.find(p => p.id === activePrep)

    return (
        <>
            <BackButton to="/products" />
            <h1 className="mb-1">{product.name}</h1>
            <p className="text-secondary mb-3">{product.brand}</p>

			<br/>
			<h6 className="text-secondary mb-2">
				Preperation{product.preperations.length > 1 ? "s" : ""}
			</h6>
            {product.preperations.length > 0 && (
                <div className="card mb-3">
                    {product.preperations.length > 1 && (
                        <div className="card-header">
                            <ul className="nav nav-tabs card-header-tabs">
                                {product.preperations.map(prep => (
                                    <li className="nav-item" key={prep.id}>
                                        <button
                                            className={`nav-link d-flex align-items-center ${activePrep === prep.id ? 'active' : ''}`}
                                            onClick={() => setActivePrep(prep.id)}
                                        >
                                            {prep.name}
                                            {prep.id === product.defaultPreperationID && (
                                                <span className="badge bg-primary ms-2">Default</span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {currentPrep && (
                        <div className="card-body">
                            <PreparationDetails
                                prep={currentPrep}
                                servingSize={servingSize}
                                onServingSizeChange={setServingSize}
                            />
                        </div>
                    )}
                </div>
            )}

            {product.barcodes.length > 0 && (
				<>
					<br />
					<BarcodeSection
						barcodes={product.barcodes}
						onSelectSize={setServingSize}
					/>
				</>
            )}
        </>
    )
}
