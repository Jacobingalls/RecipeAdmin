import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiSearchResult } from '../api';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import { servingSizeSearchParams } from '../utils';

import AddToFavoritesButton from './AddToFavoritesButton';
import { CircularButton, CircularButtonGroup, FoodItemRow } from './common';

interface SearchResultRowProps {
  result: ApiSearchResult;
  onLog?: (result: ApiSearchResult) => void;
  logLoading?: boolean;
}

export default function SearchResultRow({ result, onLog, logLoading }: SearchResultRowProps) {
  const navigate = useNavigate();

  const isProduct = !!result.item.product;
  const name = isProduct ? result.item.product!.name : (result.item.group!.name ?? 'Group');
  const brand = isProduct ? result.item.product!.brand : result.item.group?.brand;

  const servingSize = useMemo(
    () => ServingSize.fromObject(result.servingSize) ?? ServingSize.servings(1),
    [result.servingSize],
  );

  const detailPath = useMemo(() => {
    const ssParams = servingSizeSearchParams(servingSize);

    if (isProduct) {
      const params = new URLSearchParams(ssParams);
      const product = result.item.product!;
      const defaultPrepID = product.defaultPreparationID ?? product.preparations?.[0]?.id;
      if (result.item.preparationID && result.item.preparationID !== defaultPrepID) {
        params.set('prep', result.item.preparationID);
      }
      const search = params.toString();
      return `/products/${product.id}${search ? `?${search}` : ''}`;
    }

    const search = ssParams.toString();
    return `/groups/${result.item.group!.id}${search ? `?${search}` : ''}`;
  }, [isProduct, result, servingSize]);

  const calories = useMemo(() => {
    if (isProduct) {
      const p = result.item.product!;
      const prepData =
        p.preparations?.find((pr) => pr.id === result.item.preparationID) ?? p.preparations?.[0];
      if (!prepData) return null;
      const prep = new Preparation(prepData);
      try {
        return prep.nutritionalInformationFor(servingSize)?.calories?.amount ?? null;
      } catch {
        return prep.nutritionalInformation?.calories?.amount ?? null;
      }
    }

    const group = new ProductGroup(result.item.group!);
    try {
      return group.serving(servingSize).nutrition?.calories?.amount ?? null;
    } catch {
      return group.oneServing.nutrition?.calories?.amount ?? null;
    }
  }, [result, isProduct, servingSize]);

  const productId = result.item.product?.id;
  const groupId = result.item.group?.id;
  const preparationId = result.item.preparationID ?? result.item.product?.preparations?.[0]?.id;

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
    >
      {onLog && (
        <CircularButtonGroup>
          <CircularButton
            aria-label={`Log ${name}`}
            title="Add to log"
            disabled={logLoading}
            onClick={(e) => {
              e.stopPropagation();
              onLog(result);
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {logLoading ? (
              <span role="status">
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                <span className="visually-hidden">Loading</span>
              </span>
            ) : (
              <i className="bi bi-plus-lg" aria-hidden="true" />
            )}
          </CircularButton>
          <AddToFavoritesButton
            productId={productId}
            groupId={groupId}
            preparationId={preparationId}
            servingSize={servingSize}
          />
        </CircularButtonGroup>
      )}
    </FoodItemRow>
  );
}
