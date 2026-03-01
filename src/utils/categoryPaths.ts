import type { ApiCategory } from '../api';

/**
 * Walks up the `parents[0]` chain collecting slugs, joins with `.`.
 * Returns the canonical dot-separated slug path for a category.
 */
export function buildSlugPath(categoryId: string, lookup: Map<string, ApiCategory>): string {
  const slugs: string[] = [];
  let current = lookup.get(categoryId);
  while (current) {
    slugs.unshift(current.slug);
    const parentId = current.parents[0];
    current = parentId ? lookup.get(parentId) : undefined;
  }
  return slugs.join('.');
}

/**
 * Splits a dot-separated slug path and resolves each segment to an ApiCategory
 * by matching slug + parent relationship. Returns the ordered ancestor chain.
 */
export function resolvePathSegments(slugPath: string, allCategories: ApiCategory[]): ApiCategory[] {
  const segments = slugPath.split('.');
  const result: ApiCategory[] = [];
  let parentId: string | undefined;

  for (const slug of segments) {
    const match = allCategories.find(
      (c) =>
        c.slug === slug &&
        (parentId === undefined ? c.parents.length === 0 : c.parents.includes(parentId)),
    );
    if (!match) return result;
    result.push(match);
    parentId = match.id;
  }

  return result;
}
