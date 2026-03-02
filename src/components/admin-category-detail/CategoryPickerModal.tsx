import { useState, useMemo, useId } from 'react';

import type { ApiCategory } from '../../api';
import { adminUpsertCategories } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { buildSlugPath, isValidSlug, toSlug } from '../../utils';
import { ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

type RelationType = 'parents' | 'children';

// --- AddCategoryModal (search existing) ---

interface AddCategoryModalProps {
  category: ApiCategory;
  relationType: RelationType;
  onClose: () => void;
  onSaved: () => void;
}

export function AddCategoryModal({
  category,
  relationType,
  onClose,
  onSaved,
}: AddCategoryModalProps) {
  const { allCategories, lookup, addCategories } = useCategories();
  const titleId = useId();

  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reciprocal: RelationType = relationType === 'parents' ? 'children' : 'parents';
  const title = relationType === 'parents' ? 'Add parent' : 'Add child';

  const excludedIds = useMemo(() => {
    const ids = new Set(category[relationType]);
    ids.add(category.id);
    return ids;
  }, [category, relationType]);

  const filteredCategories = useMemo(
    () =>
      allCategories
        .filter((c) => !excludedIds.has(c.id))
        .filter(
          (c) =>
            !searchText ||
            c.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchText.toLowerCase()),
        )
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [allCategories, excludedIds, searchText],
  );

  async function handleAdd() {
    if (!selectedId) return;
    setError(null);
    setIsSaving(true);
    try {
      const updatedCategory: ApiCategory = {
        ...category,
        [relationType]: [...category[relationType], selectedId],
      };

      const relatedCategory = lookup.get(selectedId);
      const updates: ApiCategory[] = [updatedCategory];
      if (relatedCategory) {
        updates.push({
          ...relatedCategory,
          [reciprocal]: [...relatedCategory[reciprocal], category.id],
        });
      }

      const result = await adminUpsertCategories(updates);
      addCategories(result);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this category. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId} scrollable>
      <ModalHeader onClose={onClose} titleId={titleId}>
        {title}
      </ModalHeader>
      <ModalBody>
        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}
        <input
          type="text"
          className="form-control form-control-sm mb-3"
          placeholder="Search categories..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setSelectedId(null);
          }}
        />
        <div className="list-group" style={{ maxHeight: '16rem', overflowY: 'auto' }}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`list-group-item list-group-item-action${selectedId === c.id ? ' active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <span className="fw-bold">{c.displayName}</span>
                <br />
                <small className={selectedId === c.id ? '' : 'text-body-secondary'}>
                  {buildSlugPath(c.id, lookup)}
                </small>
              </button>
            ))
          ) : (
            <p className="text-body-secondary small mb-0">
              {searchText ? 'No matching categories' : 'No categories available'}
            </p>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAdd} disabled={!selectedId} loading={isSaving}>
          Add
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

// --- CreateCategoryModal (create new) ---

interface CreateCategoryModalProps {
  /** When provided, the new category is linked as a parent/child of this category. */
  category?: ApiCategory;
  /** Required when `category` is provided. */
  relationType?: RelationType;
  onClose: () => void;
  onSaved: () => void;
}

export function CreateCategoryModal({
  category,
  relationType,
  onClose,
  onSaved,
}: CreateCategoryModalProps) {
  const { addCategories } = useCategories();
  const titleId = useId();

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const derivedSlug = slugTouched ? newSlug : toSlug(newName);
  const slugValid = derivedSlug.length === 0 || isValidSlug(derivedSlug);

  let title = 'New category';
  if (relationType === 'parents') title = 'Create new parent';
  if (relationType === 'children') title = 'Create new child';

  function handleNameChange(value: string) {
    setNewName(value);
  }

  function handleSlugChange(value: string) {
    if (value === '') {
      // Clearing the slug resets to auto-derive mode
      setSlugTouched(false);
      setNewSlug('');
    } else {
      setSlugTouched(true);
      setNewSlug(value);
    }
  }

  const canCreate = newName.trim().length > 0 && derivedSlug.length > 0 && slugValid;

  async function handleCreate() {
    if (!canCreate) return;
    setError(null);
    setIsSaving(true);
    try {
      const newId = crypto.randomUUID();
      const newCategory: ApiCategory = {
        id: newId,
        displayName: newName.trim(),
        slug: derivedSlug,
        description: null,
        parents: category && relationType === 'children' ? [category.id] : [],
        children: category && relationType === 'parents' ? [category.id] : [],
        notes: [],
      };

      const updates: ApiCategory[] = [newCategory];
      if (category && relationType) {
        updates.push({
          ...category,
          [relationType]: [...category[relationType], newId],
        });
      }

      const result = await adminUpsertCategories(updates);
      addCategories(result);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create this category. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onClose} titleId={titleId}>
        {title}
      </ModalHeader>
      <ModalBody>
        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="new-cat-name" className="form-label">
            Display name
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="new-cat-name"
            value={newName}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="new-cat-slug" className="form-label">
            Slug
          </label>
          <input
            type="text"
            className={`form-control form-control-sm${!slugValid ? ' is-invalid' : ''}`}
            id="new-cat-slug"
            value={derivedSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
          />
          {!slugValid && (
            <div className="invalid-feedback">
              Slug must be lowercase letters, numbers, and hyphens (e.g. &quot;fresh-fruit&quot;).
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!canCreate} loading={isSaving}>
          Create
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
