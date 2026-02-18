import type { ApiLogEntry, ApiProduct } from '../api';
import type { LogTarget } from '../components/LogModal';
import type { ProductGroupData } from '../domain';
import { Preparation, ProductGroup, ServingSize } from '../domain';

import { servingSizeSearchParams } from './servingSizeParams';

/** Formats a Unix epoch timestamp (seconds) as a time-only string (e.g., "2:30 PM"). */
export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Formats a Unix epoch timestamp (seconds) as a relative time string. */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const thenMs = timestamp * 1000;
  const diffMs = now - thenMs;

  if (diffMs < 0) {
    const futurMs = -diffMs;
    const futureMinutes = Math.floor(futurMs / 60_000);
    const futureHours = Math.floor(futurMs / 3_600_000);
    const futureDays = Math.floor(futurMs / 86_400_000);

    if (futureMinutes < 1) return 'just now';
    if (futureMinutes < 60) return `in ${futureMinutes}m`;
    if (futureHours < 24) return `in ${futureHours}h`;
    if (futureDays < 7) return `in ${futureDays}d`;
    return new Date(thenMs).toLocaleDateString();
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(thenMs).toLocaleDateString();
}

/** Resolve the display name for a log entry by looking up its product or group in the provided detail maps. */
export function resolveEntryName(
  entry: ApiLogEntry,
  productDetails: Record<string, { name: string }>,
  groupDetails: Record<string, { name?: string }>,
): string {
  if (entry.item.groupID) {
    const group = groupDetails[entry.item.groupID];
    return group?.name ?? 'Unknown Group';
  }
  if (entry.item.productID) {
    const product = productDetails[entry.item.productID];
    return product?.name ?? 'Unknown Product';
  }
  return 'Unknown Item';
}

/** Resolve the brand name for a log entry by looking up its product or group in the provided detail maps. */
export function resolveEntryBrand(
  entry: ApiLogEntry,
  productDetails: Record<string, { brand?: string }>,
  groupDetails: Record<string, { brand?: string }>,
): string | undefined {
  if (entry.item.productID) {
    const product = productDetails[entry.item.productID];
    return product?.brand;
  }
  if (entry.item.groupID) {
    const group = groupDetails[entry.item.groupID];
    return group?.brand;
  }
  return undefined;
}

/** Build a navigation path to the product or group detail page, including serving size and preparation as query params. */
export function entryDetailPath(entry: ApiLogEntry): string {
  const ss = ServingSize.fromObject(entry.item.servingSize);
  const ssParams = ss ? servingSizeSearchParams(ss) : null;

  if (entry.item.groupID) {
    const search = ssParams?.toString();
    return `/groups/${entry.item.groupID}${search ? `?${search}` : ''}`;
  }
  if (entry.item.productID) {
    const params = new URLSearchParams(ssParams ?? undefined);
    if (entry.item.preparationID) {
      params.set('prep', entry.item.preparationID);
    }
    const search = params.toString();
    return `/products/${entry.item.productID}${search ? `?${search}` : ''}`;
  }
  return '#';
}

/** Format a log entry's serving size as a human-readable string (e.g., "2 servings", "150g"). */
export function formatServingSizeDescription(entry: ApiLogEntry): string {
  const ss = ServingSize.fromObject(entry.item.servingSize);
  return ss?.toString() ?? '';
}

/** Create a LogTarget from a log entry and its resolved product/group data, for use with LogModal to re-log or edit an entry. */
export function buildLogTarget(
  entry: ApiLogEntry,
  product: ApiProduct | null,
  groupData: ProductGroupData | null,
): LogTarget | null {
  const initialServingSize =
    ServingSize.fromObject(entry.item.servingSize) ?? ServingSize.servings(1);

  if (entry.item.productID && product) {
    const prepData =
      product.preparations?.find((p) => p.id === entry.item.preparationID) ??
      product.preparations?.[0];
    if (!prepData) return null;

    return {
      name: product.name,
      brand: product.brand,
      prepOrGroup: new Preparation(prepData),
      initialServingSize,
      productId: product.id,
      preparationId: prepData.id,
      editEntryId: entry.id,
      initialTimestamp: entry.timestamp,
    };
  }

  if (entry.item.groupID && groupData) {
    return {
      name: groupData.name ?? 'Group',
      brand: groupData.brand,
      prepOrGroup: new ProductGroup(groupData),
      initialServingSize,
      groupId: groupData.id,
      editEntryId: entry.id,
      initialTimestamp: entry.timestamp,
    };
  }

  return null;
}
