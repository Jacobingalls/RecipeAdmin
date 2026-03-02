import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { ApiCategory } from '../../api';
import { adminUpsertCategories } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { buildSlugPath } from '../../utils';
import { SectionHeader, DeleteButton } from '../common';

type RelationType = 'parents' | 'children';

interface CategoryRelationSectionProps {
  category: ApiCategory;
  relationType: RelationType;
  relatedCategories: ApiCategory[];
  linkFor: (related: ApiCategory) => string;
  onAdd: () => void;
  onCreateNew: () => void;
  onSaved: () => void;
}

export default function CategoryRelationSection({
  category,
  relationType,
  relatedCategories,
  linkFor,
  onAdd,
  onCreateNew,
  onSaved,
}: CategoryRelationSectionProps) {
  const { lookup, addCategories } = useCategories();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = relationType === 'parents' ? 'Parents' : 'Children';
  const reciprocal: RelationType = relationType === 'parents' ? 'children' : 'parents';
  const emptyText = relationType === 'parents' ? 'No parents' : 'No children';

  async function handleRemove(relatedId: string) {
    setError(null);
    setRemovingId(relatedId);
    try {
      const updatedCategory: ApiCategory = {
        ...category,
        [relationType]: category[relationType].filter((id) => id !== relatedId),
      };

      const relatedCategory = lookup.get(relatedId);
      const updates: ApiCategory[] = [updatedCategory];
      if (relatedCategory) {
        updates.push({
          ...relatedCategory,
          [reciprocal]: relatedCategory[reciprocal].filter((id) => id !== category.id),
        });
      }

      const result = await adminUpsertCategories(updates);
      addCategories(result);
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't remove this relationship. Try again.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <SectionHeader title={title} className="mt-5">
        <div className="dropdown">
          <button
            className="btn btn-dark btn-sm dropdown-toggle px-3"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Add
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" type="button" onClick={onAdd}>
                <i className="bi bi-link-45deg me-2" aria-hidden="true" />
                Existing category
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={onCreateNew}>
                <i className="bi bi-plus-circle me-2" aria-hidden="true" />
                New category
              </button>
            </li>
          </ul>
        </div>
      </SectionHeader>
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      {relatedCategories.length > 0 ? (
        <div className="list-group">
          {relatedCategories.map((c) => (
            <div
              key={c.id}
              className="list-group-item d-flex align-items-center justify-content-between py-2"
            >
              <Link to={linkFor(c)} className="text-decoration-none text-body me-auto">
                <span className="fw-bold">{c.displayName}</span>
                <br />
                <small className="text-body-secondary font-monospace">
                  {buildSlugPath(c.id, lookup)}
                </small>
              </Link>
              <DeleteButton
                ariaLabel={`Remove ${c.displayName}`}
                onClick={() => handleRemove(c.id)}
              />
              {removingId === c.id && (
                <span className="visually-hidden" role="status">
                  Removing
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small mb-0">{emptyText}</p>
      )}
    </>
  );
}
