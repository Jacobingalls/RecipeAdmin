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
 * Computes all possible dot-separated slug paths for a category by walking
 * up every parent chain. Categories with multiple parents produce multiple paths.
 */
export function buildAllSlugPaths(categoryId: string, lookup: Map<string, ApiCategory>): string[] {
  const cat = lookup.get(categoryId);
  if (!cat) return [];
  if (cat.parents.length === 0) return [cat.slug];
  const paths: string[] = [];
  for (const parentId of cat.parents) {
    const parentPaths = buildAllSlugPaths(parentId, lookup);
    if (parentPaths.length === 0) {
      paths.push(cat.slug);
    } else {
      for (const pp of parentPaths) {
        paths.push(`${pp}.${cat.slug}`);
      }
    }
  }
  return paths;
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
