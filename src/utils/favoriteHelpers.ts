import type { ApiFavorite, ApiProduct, LogEntryRequest } from '../api';
import type { LogTarget } from '../components/LogModal';
import type { ProductGroupData } from '../domain';
import { Preparation, ProductGroup, ServingSize } from '../domain';

import { servingSizeSearchParams } from './servingSizeParams';

export type ProductLookup = Record<string, ApiProduct>;
export type GroupLookup = Record<string, ProductGroupData>;

/** Returns the display name for a favorite (product name or group name). */
export function favoriteName(
  fav: ApiFavorite,
  products: ProductLookup,
  groups: GroupLookup,
): string {
  if (fav.item.productID) {
    return products[fav.item.productID]?.name ?? 'Unknown';
  }
  if (fav.item.groupID) {
    return groups[fav.item.groupID]?.name ?? 'Group';
  }
  return 'Unknown';
}

/** Returns the brand for a favorite, if available. */
export function favoriteBrand(
  fav: ApiFavorite,
  products: ProductLookup,
  groups: GroupLookup,
): string | undefined {
  if (fav.item.productID) return products[fav.item.productID]?.brand;
  if (fav.item.groupID) return groups[fav.item.groupID]?.brand;
  return undefined;
}

/** Returns the detail page path for a favorite's underlying item. */
export function favoriteDetailPath(fav: ApiFavorite): string {
  const ss = ServingSize.fromObject(fav.item.servingSize);
  const ssParams = ss ? servingSizeSearchParams(ss) : null;

  if (fav.item.productID) {
    const params = new URLSearchParams(ssParams ?? undefined);
    // Can't determine default prep without resolved data, so always include prep if set
    if (fav.item.preparationID) {
      params.set('prep', fav.item.preparationID);
    }
    const search = params.toString();
    return `/products/${fav.item.productID}${search ? `?${search}` : ''}`;
  }
  if (fav.item.groupID) {
    const search = ssParams?.toString();
    return `/groups/${fav.item.groupID}${search ? `?${search}` : ''}`;
  }
  return '#';
}

/** Computes the calorie count for a favorite at its current serving size. */
export function favoriteCalories(
  fav: ApiFavorite,
  products: ProductLookup,
  groups: GroupLookup,
): number | null {
  const servingSize = ServingSize.fromObject(fav.item.servingSize) ?? ServingSize.servings(1);

  if (fav.item.productID) {
    const product = products[fav.item.productID];
    const prepData =
      product?.preparations?.find((p) => p.id === fav.item.preparationID) ??
      product?.preparations?.[0];
    if (!prepData) return null;

    try {
      const prep = new Preparation(prepData);
      const nutrition = prep.nutritionalInformationFor(servingSize);
      return nutrition.calories?.amount ?? null;
    } catch {
      return null;
    }
  }

  if (fav.item.groupID) {
    const groupData = groups[fav.item.groupID];
    if (!groupData) return null;
    try {
      const group = new ProductGroup(groupData);
      const { nutrition } = group.serving(servingSize);
      return nutrition.calories?.amount ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

/** Returns a human-readable serving size description for a favorite. */
export function favoriteServingSizeDescription(fav: ApiFavorite): string {
  const ss = ServingSize.fromObject(fav.item.servingSize);
  return ss?.toString() ?? '';
}

/** Builds the params needed to call logEntry() directly from a favorite. */
export function buildFavoriteLogParams(
  fav: ApiFavorite,
  products: ProductLookup,
): LogEntryRequest | null {
  if (fav.item.productID) {
    const product = products[fav.item.productID];
    const prepData =
      product?.preparations?.find((p) => p.id === fav.item.preparationID) ??
      product?.preparations?.[0];
    if (!prepData) return null;

    return {
      productId: fav.item.productID,
      preparationId: prepData.id,
      servingSize: fav.item.servingSize,
    };
  }

  if (fav.item.groupID) {
    return {
      groupId: fav.item.groupID,
      servingSize: fav.item.servingSize,
    };
  }

  return null;
}

/** Builds a LogTarget for the LogModal from a favorite's resolved data. */
export function buildFavoriteLogTarget(
  fav: ApiFavorite,
  products: ProductLookup,
  groups: GroupLookup,
): LogTarget | null {
  const initialServingSize =
    ServingSize.fromObject(fav.item.servingSize) ?? ServingSize.servings(1);

  if (fav.item.productID) {
    const product = products[fav.item.productID];
    const prepData =
      product?.preparations?.find((p) => p.id === fav.item.preparationID) ??
      product?.preparations?.[0];
    if (!prepData) return null;

    return {
      name: product?.name ?? 'Unknown',
      brand: product?.brand,
      prepOrGroup: new Preparation(prepData),
      initialServingSize,
      productId: fav.item.productID,
      preparationId: prepData.id,
    };
  }

  if (fav.item.groupID) {
    const groupData = groups[fav.item.groupID];
    if (!groupData) return null;
    return {
      name: groupData.name ?? 'Group',
      brand: groupData.brand,
      prepOrGroup: new ProductGroup(groupData),
      initialServingSize,
      groupId: fav.item.groupID,
    };
  }

  return null;
}
