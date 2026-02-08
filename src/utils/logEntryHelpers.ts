import type { ApiLogEntry, ApiProductSummary, ApiGroupSummary } from '../api';
import { ServingSize } from '../domain';

/** Formats a Unix epoch timestamp (seconds) as a relative time string. */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const thenMs = timestamp * 1000;
  const diffMs = now - thenMs;
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
