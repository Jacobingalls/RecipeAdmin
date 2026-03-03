import { useState, useMemo, useId } from 'react';

import type { ProductGroupData } from '../../domain';
import { useCategories } from '../../contexts/CategoriesContext';
import { buildSlugPath } from '../../utils';
import {
  SectionHeader,
  DeleteButton,
  Button,
  ModalBase,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../common';
import { CreateCategoryModal } from '../admin-category-detail';

// --- Category picker modal ---

function CategoryPicker({
  excludedIds,
  onAdd,
  onClose,
}: {
  excludedIds: Set<string>;
  onAdd: (id: string) => void;
  onClose: () => void;
}) {
  const { allCategories, lookup } = useCategories();
  const titleId = useId();
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId} scrollable>
      <ModalHeader onClose={onClose} titleId={titleId}>
        Add existing category
      </ModalHeader>
      <ModalBody>
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
        <Button
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) onAdd(selectedId);
          }}
        >
          Add
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

// --- Main section ---

type CategoryModal = 'existing' | 'new' | null;

interface GroupCategoriesSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupCategoriesSection({ group, onChange }: GroupCategoriesSectionProps) {
  const { lookup } = useCategories();
  const categoryIds = useMemo(() => group.categories ?? [], [group.categories]);
  const [modal, setModal] = useState<CategoryModal>(null);

  const categories = useMemo(
    () =>
      categoryIds
        .map((id) => {
          const cat = lookup.get(id);
          if (!cat) return null;
          return { id, name: cat.displayName, path: buildSlugPath(id, lookup) };
        })
        .filter((c): c is { id: string; name: string; path: string } => c !== null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categoryIds, lookup],
  );

  const excludedIds = useMemo(() => new Set(categoryIds), [categoryIds]);

  function handleAddExisting(categoryId: string) {
    setModal(null);
    onChange({ ...group, categories: [...categoryIds, categoryId] });
  }

  function handleRemove(categoryId: string) {
    onChange({ ...group, categories: categoryIds.filter((id) => id !== categoryId) });
  }

  return (
    <>
      <SectionHeader title="Categories" className="mt-5">
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
              <button className="dropdown-item" type="button" onClick={() => setModal('existing')}>
                <i className="bi bi-link-45deg me-2" aria-hidden="true" />
                Existing category
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={() => setModal('new')}>
                <i className="bi bi-plus-circle me-2" aria-hidden="true" />
                New category
              </button>
            </li>
          </ul>
        </div>
      </SectionHeader>
      {categories.length > 0 ? (
        <div className="list-group">
          {categories.map((c) => (
            <div
              key={c.id}
              className="list-group-item d-flex align-items-center justify-content-between py-2"
            >
              <div>
                <span className="fw-bold">{c.name}</span>
                <br />
                <small className="text-body-secondary font-monospace">{c.path}</small>
              </div>
              <DeleteButton ariaLabel={`Remove ${c.name}`} onClick={() => handleRemove(c.id)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-body-secondary small mb-0">No categories</p>
          </div>
        </div>
      )}

      {modal === 'existing' && (
        <CategoryPicker
          excludedIds={excludedIds}
          onAdd={handleAddExisting}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'new' && (
        <CreateCategoryModal onClose={() => setModal(null)} onSaved={() => setModal(null)} />
      )}
    </>
  );
}
