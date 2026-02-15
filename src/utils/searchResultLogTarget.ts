import type { ApiSearchResult } from '../api';
import type { LogTarget } from '../components/LogModal';
import { Preparation, ProductGroup, ServingSize } from '../domain';

/** Builds a LogTarget from an ApiSearchResult for use with LogModal. */
export function buildSearchResultLogTarget(result: ApiSearchResult): LogTarget | null {
  const servingSize = ServingSize.fromObject(result.servingSize) || ServingSize.servings(1);

  if (result.item.product) {
    const p = result.item.product;
    const prepData =
      p.preparations?.find((pr) => pr.id === result.item.preparationID) || p.preparations?.[0];
    if (!prepData) return null;
    const prep = new Preparation(prepData);

    return {
      name: p.name,
      brand: p.brand,
      prepOrGroup: prep,
      initialServingSize: servingSize,
      productId: p.id,
      preparationId: prepData.id,
    };
  }

  if (result.item.group) {
    const g = result.item.group;
    const group = new ProductGroup(g);

    return {
      name: g.name || 'Group',
      brand: g.brand,
      prepOrGroup: group,
      initialServingSize: servingSize,
      groupId: g.id,
    };
  }

  return null;
}
