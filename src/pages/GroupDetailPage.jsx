import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGroup, getProduct } from '../api'
import { useApiQuery } from '../hooks'
import { ServingSize, ProductGroup } from '../domain'
import { LoadingState, ErrorState, EmptyState, BackButton } from '../components/common'
import BarcodeSection from '../components/BarcodeSection'
import NutritionLabel from '../components/NutritionLabel'
import ServingSizeSelector from '../components/ServingSizeSelector'
import CustomSizesSection from '../components/CustomSizesSection'

/**
 * Recursively fetch all nested items for a group.
 * Transforms items with productID/groupID into items with product/group objects.
 */
async function fetchNestedItems(items) {
    return Promise.all(items.map(async (item) => {
        if (item.productID) {
            const product = await getProduct(item.productID)
            return { ...item, product }
        }
        if (item.groupID) {
            const nestedGroup = await getGroup(item.groupID)
            // Recursively fetch nested items for this group too
            nestedGroup.items = await fetchNestedItems(nestedGroup.items || [])
            return { ...item, group: nestedGroup }
        }
        return item
    }))
}

export default function GroupDetailPage() {
    const { id } = useParams()
    const { data: groupData, loading, error } = useApiQuery(() => getGroup(id), [id])
    const [servingSize, setServingSize] = useState(() => ServingSize.servings(1))
    const [populatedGroup, setPopulatedGroup] = useState(null)
    const [itemsLoading, setItemsLoading] = useState(false)

    // Fetch nested items when groupData changes
    useEffect(() => {
        if (!groupData) {
            setPopulatedGroup(null)
            return
        }

        setItemsLoading(true)
        fetchNestedItems(groupData.items || [])
            .then(populatedItems => {
                setPopulatedGroup({
                    ...groupData,
                    items: populatedItems
                })
            })
            .catch(err => {
                console.error('Failed to fetch nested items:', err)
                // Fall back to unpopulated group
                setPopulatedGroup(groupData)
            })
            .finally(() => setItemsLoading(false))
    }, [groupData])

    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error} />
    if (!groupData) return <EmptyState message="Group not found" />

    const group = populatedGroup ? new ProductGroup(populatedGroup) : null

    let nutritionInfo = null
    let nutritionError = null
    if (group) {
        try {
            nutritionInfo = group.serving(servingSize).nutrition
        } catch (e) {
            nutritionError = e.message
        }
    }

    return (
        <>
            <BackButton to="/groups" />
            <h1 className="mb-1">{groupData.name}</h1>
            <p className="text-secondary mb-3">{groupData.items.length} item{groupData.items.length !== 1 ? 's' : ''}</p>

            <br/>
            <h6 className="text-secondary mb-2">Nutrition Estimate</h6>
            <div className="card mb-3">
                <div className="card-body">
                    {itemsLoading ? (
                        <div className="text-secondary">Loading nutrition data...</div>
                    ) : group ? (
                        <>
                            <div className="mb-3">
                                <ServingSizeSelector prep={group} value={servingSize} onChange={setServingSize} />
                            </div>

                            {nutritionError && <div className="text-danger small mb-3">{nutritionError}</div>}
                            {nutritionInfo && <NutritionLabel nutritionInfo={nutritionInfo} servingSize={servingSize} prep={group} />}
                        </>
                    ) : (
                        <div className="text-secondary">Unable to calculate nutrition</div>
                    )}
                </div>
            </div>

            {group && group.customSizes.length > 0 && (
                <>
                    <br />
                    <CustomSizesSection
                        customSizes={group.customSizes}
                        onSelectSize={setServingSize}
                    />
                </>
            )}

            <br/>
            <h6 className="text-secondary mb-2">
                Item{groupData.items.length !== 1 ? 's' : ''}
            </h6>
            {groupData.items.length === 0 ? (
                <p className="text-secondary">No items in this group</p>
            ) : (
                <div className="list-group mb-3">
                    {groupData.items.map((item, i) => (
                        <GroupItemRow key={i} item={item} />
                    ))}
                </div>
            )}

            {groupData.barcodes.length > 0 && (
                <>
                    <br />
                    <BarcodeSection barcodes={groupData.barcodes} onSelectSize={setServingSize} />
                </>
            )}
        </>
    )
}

function GroupItemRow({ item }) {
    const servingSize = item.servingSize ? ServingSize.fromObject(item.servingSize) : null

    if (item.productID) {
        return <ProductItemRow productID={item.productID} servingSize={servingSize} />
    }
    if (item.groupID) {
        return <GroupItemLink groupID={item.groupID} servingSize={servingSize} />
    }
    return null
}

function ProductItemRow({ productID, servingSize }) {
    const { data: product, loading, error } = useApiQuery(() => getProduct(productID), [productID])

    const servingSizeDisplay = servingSize ? servingSize.toString() : null

    if (loading) {
        return (
            <div className="list-group-item">
                <span className="text-secondary">Loading...</span>
            </div>
        )
    }

    if (error || !product) {
        return (
            <Link to={`/products/${productID}`} className="list-group-item list-group-item-action">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <span className="badge bg-primary me-2">Product</span>
                        <code className="small">{productID.slice(0, 8)}...</code>
                    </div>
                    {servingSizeDisplay && (
                        <span className="text-secondary small">{servingSizeDisplay}</span>
                    )}
                </div>
            </Link>
        )
    }

    return (
        <Link to={`/products/${productID}`} className="list-group-item list-group-item-action">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <span className="badge bg-primary me-2">Product</span>
                    <span className="fw-medium">{product.name}</span>
                    {product.brand && (
                        <span className="text-secondary ms-2 small">{product.brand}</span>
                    )}
                </div>
                {servingSizeDisplay && (
                    <span className="text-secondary small">{servingSizeDisplay}</span>
                )}
            </div>
        </Link>
    )
}

function GroupItemLink({ groupID, servingSize }) {
    const { data: group, loading, error } = useApiQuery(() => getGroup(groupID), [groupID])

    const servingSizeDisplay = servingSize ? servingSize.toString() : null

    if (loading) {
        return (
            <div className="list-group-item">
                <span className="text-secondary">Loading...</span>
            </div>
        )
    }

    if (error || !group) {
        return (
            <Link to={`/groups/${groupID}`} className="list-group-item list-group-item-action">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <span className="badge bg-secondary me-2">Group</span>
                        <code className="small">{groupID.slice(0, 8)}...</code>
                    </div>
                    {servingSizeDisplay && (
                        <span className="text-secondary small">{servingSizeDisplay}</span>
                    )}
                </div>
            </Link>
        )
    }

    return (
        <Link to={`/groups/${groupID}`} className="list-group-item list-group-item-action">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <span className="badge bg-secondary me-2">Group</span>
                    <span className="fw-medium">{group.name}</span>
                    <span className="text-secondary ms-2 small">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
                </div>
                {servingSizeDisplay && (
                    <span className="text-secondary small">{servingSizeDisplay}</span>
                )}
            </div>
        </Link>
    )
}
