import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { GroupItem } from '../../domain';
import { ProductGroup, ServingSize } from '../../domain';
import { servingSizeSearchParams } from '../../utils';
import { FoodItemRow } from '../common';

interface GroupItemRowProps {
  item: GroupItem;
}

export default function GroupItemRow({ item }: GroupItemRowProps) {
  const navigate = useNavigate();

  const isProduct = !!item.product;
  const name = isProduct ? (item.product?.name ?? 'Product') : (item.group?.name ?? 'Group');
  const brand = isProduct ? item.product?.brand : item.group?.brand;

  const servingSize = useMemo(
    () =>
      (item.servingSize ? ServingSize.fromObject(item.servingSize) : null) ??
      ServingSize.servings(1),
    [item.servingSize],
  );

  const calories = useMemo(() => {
    const serving = ProductGroup.getItemServing(item);
    return serving?.nutrition?.calories?.amount ?? null;
  }, [item]);

  const detailPath = useMemo(() => {
    const id = item.product?.id ?? item.group?.id;
    if (!id) return '#';
    const ssParams = servingSizeSearchParams(servingSize);
    if (isProduct) {
      if (item.preparationID) {
        ssParams.set('prep', item.preparationID);
      }
      return `/products/${id}?${ssParams}`;
    }
    return `/groups/${id}?${ssParams}`;
  }, [isProduct, servingSize, item.preparationID, item.product, item.group]);

  if (!item.product && !item.group) return null;

  const subtitle = (
    <>
      {brand && <>{brand} &middot; </>}
      {servingSize.toString()}
    </>
  );

  return (
    <FoodItemRow
      name={name}
      subtitle={subtitle}
      calories={calories}
      ariaLabel={`View ${name}`}
      onClick={() => navigate(detailPath)}
    />
  );
}
