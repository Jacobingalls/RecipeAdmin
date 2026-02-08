import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { getGroup } from '../api';
import { useApiQuery } from '../hooks';
import type { GroupItem, ProductGroupData } from '../domain';
import { ServingSize, ProductGroup } from '../domain';
import { LoadingState, ErrorState, ContentUnavailableView, BackButton } from '../components/common';
import BarcodeSection from '../components/BarcodeSection';
import NutritionLabel from '../components/NutritionLabel';
import ServingSizeSelector from '../components/ServingSizeSelector';
import CustomSizesSection from '../components/CustomSizesSection';
import AddToLogButton from '../components/AddToLogButton';

interface GroupItemRowProps {
  item: GroupItem;
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: groupData,
    loading,
    error,
  } = useApiQuery<ProductGroupData>(() => getGroup(id!), [id]);
  const [servingSize, setServingSize] = useState(() => ServingSize.servings(1));

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!groupData) return <ContentUnavailableView icon="bi-collection" title="Group Not Found" />;

  const group = new ProductGroup(groupData);
  const items = groupData.items ?? [];
  const barcodes = groupData.barcodes ?? [];

  let nutritionInfo = null;
  let nutritionError = null;
  try {
    nutritionInfo = group.serving(servingSize).nutrition;
  } catch (e: unknown) {
    nutritionError = (e as Error).message;
  }

  return (
    <>
      <BackButton to="/groups" />
      <h1 className="mb-1">{groupData.name}</h1>
      <p className="text-secondary mb-3">
        {items.length} item{items.length !== 1 ? 's' : ''}
      </p>

      <br />
      <h6 className="text-secondary mb-2">Nutrition Estimate</h6>
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-end mb-3">
            <ServingSizeSelector prep={group} value={servingSize} onChange={setServingSize} />
            <div className="ms-auto">
              <AddToLogButton groupId={groupData.id} servingSize={servingSize} />
            </div>
          </div>

          {nutritionError && <div className="text-danger small mb-3">{nutritionError}</div>}
          {nutritionInfo && (
            <NutritionLabel nutritionInfo={nutritionInfo} servingSize={servingSize} prep={group} />
          )}
        </div>
      </div>

      {group.customSizes.length > 0 && (
        <>
          <br />
          <CustomSizesSection customSizes={group.customSizes} onSelectSize={setServingSize} />
        </>
      )}

      <br />
      <h6 className="text-secondary mb-2">Item{items.length !== 1 ? 's' : ''}</h6>
      {items.length === 0 ? (
        <p className="text-secondary">No items in this group</p>
      ) : (
        <div className="list-group mb-3">
          {items.map((item) => (
            <GroupItemRow key={item.product?.id ?? item.group?.id} item={item} />
          ))}
        </div>
      )}

      {barcodes.length > 0 && (
        <>
          <br />
          <BarcodeSection barcodes={barcodes} onSelectSize={setServingSize} />
        </>
      )}
    </>
  );
}

function GroupItemRow({ item }: GroupItemRowProps) {
  const servingSizeObj = item.servingSize ? ServingSize.fromObject(item.servingSize) : null;
  const servingSizeDisplay = servingSizeObj ? servingSizeObj.toString() : null;

  if (item.product) {
    const { product } = item;
    return (
      <Link to={`/products/${product.id}`} className="list-group-item list-group-item-action">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-primary me-2">Product</span>
            <span className="fw-medium">{product.name}</span>
            {product.brand && <span className="text-secondary ms-2 small">{product.brand}</span>}
          </div>
          {servingSizeDisplay && <span className="text-secondary small">{servingSizeDisplay}</span>}
        </div>
      </Link>
    );
  }

  if (item.group) {
    const { group } = item;
    return (
      <Link to={`/groups/${group.id}`} className="list-group-item list-group-item-action">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-secondary me-2">Group</span>
            <span className="fw-medium">{group.name}</span>
            <span className="text-secondary ms-2 small">
              {(group.items ?? []).length} item{(group.items ?? []).length !== 1 ? 's' : ''}
            </span>
          </div>
          {servingSizeDisplay && <span className="text-secondary small">{servingSizeDisplay}</span>}
        </div>
      </Link>
    );
  }

  return null;
}
