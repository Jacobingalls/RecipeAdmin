import { useParams, Link } from 'react-router-dom';

import { getGroup } from '../api';
import { useApiQuery, useServingSizeParams } from '../hooks';
import type { GroupItem, ProductGroupData } from '../domain';
import { ServingSize, ProductGroup } from '../domain';
import {
  LoadingState,
  ErrorState,
  ContentUnavailableView,
  SubsectionTitle,
} from '../components/common';
import BarcodeSection from '../components/BarcodeSection';
import NutritionLabel from '../components/NutritionLabel';
import ServingSizeSelector from '../components/ServingSizeSelector';
import CustomSizesSection from '../components/CustomSizesSection';
import AddToFavoritesButton from '../components/AddToFavoritesButton';
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
  } = useApiQuery<ProductGroupData>(() => getGroup(id!), [id], {
    errorMessage: "Couldn't load this group. Try again later.",
  });
  const [servingSize, setServingSize] = useServingSizeParams();

  const group = groupData ? new ProductGroup(groupData) : null;
  const items = groupData?.items ?? [];
  const barcodes = groupData?.barcodes ?? [];

  let nutritionInfo = null;
  let nutritionError = null;
  if (group) {
    try {
      nutritionInfo = group.serving(servingSize).nutrition;
    } catch (e: unknown) {
      nutritionError = (e as Error).message;
    }
  }

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !groupData && (
        <ContentUnavailableView icon="bi-collection" title="Group not found" />
      )}
      {!loading && !error && groupData && (
        <>
          <h1 className="mb-1">{groupData.name}</h1>
          <p className="text-secondary mb-3">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>

          <section className="mt-4">
            <SubsectionTitle>Nutrition Estimate</SubsectionTitle>
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-end mb-3">
                  <ServingSizeSelector
                    prep={group!}
                    value={servingSize}
                    onChange={setServingSize}
                  />
                  <div className="ms-auto d-flex gap-2">
                    <AddToLogButton groupId={groupData.id} servingSize={servingSize} />
                    <AddToFavoritesButton groupId={groupData.id} servingSize={servingSize} />
                  </div>
                </div>

                {nutritionError && <div className="text-danger small mb-3">{nutritionError}</div>}
                {nutritionInfo && (
                  <NutritionLabel
                    nutritionInfo={nutritionInfo}
                    servingSize={servingSize}
                    prep={group!}
                  />
                )}
              </div>
            </div>
          </section>

          {group!.customSizes.length > 0 && (
            <CustomSizesSection customSizes={group!.customSizes} onSelectSize={setServingSize} />
          )}

          <section className="mt-4">
            <SubsectionTitle>Item{items.length !== 1 ? 's' : ''}</SubsectionTitle>
            {items.length === 0 ? (
              <p className="text-secondary">No items in this group</p>
            ) : (
              <div className="list-group mb-3">
                {items.map((item) => (
                  <GroupItemRow key={item.product?.id ?? item.group?.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {barcodes.length > 0 && (
            <BarcodeSection barcodes={barcodes} onSelectSize={setServingSize} />
          )}
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
