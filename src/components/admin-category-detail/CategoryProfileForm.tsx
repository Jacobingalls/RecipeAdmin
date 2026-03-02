import type { FormEvent, ReactNode } from 'react';
import { useState, useEffect } from 'react';

import type { ApiCategory } from '../../api';
import { adminUpsertCategories } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { isValidSlug } from '../../utils/slugValidation';
import { SectionHeader, Button } from '../common';

interface CategoryProfileFormProps {
  category: ApiCategory;
  onSaved: () => void;
}

function InlineFormField({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="list-group-item d-flex align-items-center justify-content-between py-3"
    >
      <span className="me-3 flex-shrink-0">{label}</span>
      {children}
    </label>
  );
}

export default function CategoryProfileForm({ category, onSaved }: CategoryProfileFormProps) {
  const { addCategories } = useCategories();
  const [editDisplayName, setEditDisplayName] = useState(category.displayName);
  const [editSlug, setEditSlug] = useState(category.slug);
  const [editDescription, setEditDescription] = useState(category.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditDisplayName(category.displayName);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? '');
  }, [category.displayName, category.slug, category.description]);

  const slugValid = isValidSlug(editSlug);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slugValid) return;
    setError(null);
    setIsSaving(true);
    try {
      const updated: ApiCategory = {
        ...category,
        displayName: editDisplayName,
        slug: editSlug,
        description: editDescription || null,
      };
      const result = await adminUpsertCategories(updated);
      addCategories(result);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this category. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <SectionHeader title="Profile" className="mt-5">
        <Button type="submit" form="edit-category-form" size="sm" loading={isSaving}>
          Save
        </Button>
      </SectionHeader>
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}
      <form id="edit-category-form" onSubmit={handleSubmit}>
        <div className="list-group">
          <InlineFormField htmlFor="edit-display-name" label="Display name">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-display-name"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              required
            />
          </InlineFormField>
          <InlineFormField htmlFor="edit-slug" label="Slug">
            <div style={{ maxWidth: '20rem', width: '100%' }}>
              <input
                type="text"
                className={`form-control form-control-sm${!slugValid ? ' is-invalid' : ''}`}
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                required
              />
              {!slugValid && (
                <div className="invalid-feedback">
                  Lowercase letters, numbers, and hyphens only.
                </div>
              )}
            </div>
          </InlineFormField>
          <InlineFormField htmlFor="edit-description" label="Description">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: '20rem' }}
              id="edit-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional"
            />
          </InlineFormField>
        </div>
      </form>
    </>
  );
}
