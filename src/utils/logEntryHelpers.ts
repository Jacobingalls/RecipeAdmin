import type { ApiLogEntry, ApiProduct, ApiProductSummary, ApiGroupSummary } from '../api';
import type { LogTarget } from '../components/LogModal';
import type { ProductGroupData } from '../domain';
import { Preparation, ProductGroup, ServingSize } from '../domain';

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

export function resolveEntryName(
  entry: ApiLogEntry,
  products: ApiProductSummary[],
  groups: ApiGroupSummary[],
): string {
  if (entry.item.kind === 'group' && entry.item.groupID) {
    const group = groups.find((g) => g.id === entry.item.groupID);
    return group?.name ?? 'Unknown Group';
  }
  if (entry.item.productID) {
    const product = products.find((p) => p.id === entry.item.productID);
    return product?.name ?? 'Unknown Product';
  }
  return 'Unknown Item';
}

export function resolveEntryBrand(
  entry: ApiLogEntry,
  products: ApiProductSummary[],
): string | undefined {
  if (entry.item.kind === 'product' && entry.item.productID) {
    const product = products.find((p) => p.id === entry.item.productID);
    return product?.brand;
  }
  return undefined;
}

export function entryDetailPath(entry: ApiLogEntry): string {
  if (entry.item.kind === 'group' && entry.item.groupID) {
    return `/groups/${entry.item.groupID}`;
  }
  if (entry.item.productID) {
    return `/products/${entry.item.productID}`;
  }
  return '#';
}

export function formatServingSizeDescription(entry: ApiLogEntry): string {
  const ss = ServingSize.fromObject(entry.item.servingSize);
  return ss?.toString() ?? '';
}

export function buildLogTarget(
  entry: ApiLogEntry,
  product: ApiProduct | null,
  groupData: ProductGroupData | null,
): LogTarget | null {
  const initialServingSize =
    ServingSize.fromObject(entry.item.servingSize) ?? ServingSize.servings(1);

  if (entry.item.kind === 'product' && product) {
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
    };
  }

  if (entry.item.kind === 'group' && groupData) {
    return {
      name: groupData.name ?? 'Group',
      prepOrGroup: new ProductGroup(groupData),
      initialServingSize,
      groupId: groupData.id,
      editEntryId: entry.id,
    };
  }

  return null;
}
