import type { ApiFavorite, LogEntryRequest } from '../api';
import type { LogTarget } from '../components/LogModal';
import { Preparation, ProductGroup, ServingSize } from '../domain';

import { servingSizeSearchParams } from './servingSizeParams';

/** Returns the display name for a favorite (product name or group name). */
export function favoriteName(fav: ApiFavorite): string {
  if (fav.item.product) {
    return fav.item.product.name;
  }
  if (fav.item.group) {
    return fav.item.group.name ?? 'Group';
  }
  return 'Unknown';
}

/** Returns the brand for a favorite, if available. */
export function favoriteBrand(fav: ApiFavorite): string | undefined {
  return fav.item.product?.brand ?? fav.item.group?.brand;
}

/** Returns the detail page path for a favorite's underlying item. */
export function favoriteDetailPath(fav: ApiFavorite): string {
  const ss = ServingSize.fromObject(fav.item.servingSize);
  const ssParams = ss ? servingSizeSearchParams(ss) : null;

  if (fav.item.product) {
    const params = new URLSearchParams(ssParams ?? undefined);
    const defaultPrepID =
      fav.item.product.defaultPreparationID ?? fav.item.product.preparations?.[0]?.id;
    if (fav.item.preparationID && fav.item.preparationID !== defaultPrepID) {
      params.set('prep', fav.item.preparationID);
    }
    const search = params.toString();
    return `/products/${fav.item.product.id}${search ? `?${search}` : ''}`;
  }
  if (fav.item.group) {
    const search = ssParams?.toString();
    return `/groups/${fav.item.group.id}${search ? `?${search}` : ''}`;
  }
  return '#';
}

/** Computes the calorie count for a favorite at its current serving size. */
export function favoriteCalories(fav: ApiFavorite): number | null {
  const servingSize = ServingSize.fromObject(fav.item.servingSize) ?? ServingSize.servings(1);

  if (fav.item.product) {
    const prepData =
      fav.item.product.preparations?.find((p) => p.id === fav.item.preparationID) ??
      fav.item.product.preparations?.[0];
    if (!prepData) return null;

    try {
      const prep = new Preparation(prepData);
      const nutrition = prep.nutritionalInformationFor(servingSize);
      return nutrition.calories?.amount ?? null;
    } catch {
      return null;
    }
  }

  if (fav.item.group) {
    try {
      const group = new ProductGroup(fav.item.group);
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
export function buildFavoriteLogParams(fav: ApiFavorite): LogEntryRequest | null {
  if (fav.item.product) {
    const prepData =
      fav.item.product.preparations?.find((p) => p.id === fav.item.preparationID) ??
      fav.item.product.preparations?.[0];
    if (!prepData) return null;

    return {
      productId: fav.item.product.id,
      preparationId: prepData.id,
      servingSize: fav.item.servingSize,
    };
  }

  if (fav.item.group) {
    return {
      groupId: fav.item.group.id,
      servingSize: fav.item.servingSize,
    };
  }

  return null;
}

/** Builds a LogTarget for the LogModal from a favorite's resolved data. */
export function buildFavoriteLogTarget(fav: ApiFavorite): LogTarget | null {
  const initialServingSize =
    ServingSize.fromObject(fav.item.servingSize) ?? ServingSize.servings(1);

  if (fav.item.product) {
    const prepData =
      fav.item.product.preparations?.find((p) => p.id === fav.item.preparationID) ??
      fav.item.product.preparations?.[0];
    if (!prepData) return null;

    return {
      name: fav.item.product.name,
      brand: fav.item.product.brand,
      prepOrGroup: new Preparation(prepData),
      initialServingSize,
      productId: fav.item.product.id,
      preparationId: prepData.id,
    };
  }

  if (fav.item.group) {
    return {
      name: fav.item.group.name ?? 'Group',
      brand: fav.item.group.brand,
      prepOrGroup: new ProductGroup(fav.item.group),
      initialServingSize,
      groupId: fav.item.group.id,
    };
  }

  return null;
}
