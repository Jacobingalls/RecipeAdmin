import { useState, useMemo, useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiProduct } from '../../api';
import { useCategories } from '../../contexts/CategoriesContext';
import { buildSlugPath } from '../../utils';
import { DeleteButton, Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';
import { CreateCategoryModal } from '../admin-category-detail';

interface PreparationCategoriesSectionProps {
  product: ApiProduct;
  preparationId: string;
  onChange: (product: ApiProduct) => void;
}

// --- Category picker modal for prep categories ---

function CategoryPickerForPrep({
  excludedIds,
  onAdd,
  onClose,
}: {
  excludedIds: Set<string>;
  onAdd: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
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
        {t('editor.addExistingCategory')}
      </ModalHeader>
      <ModalBody>
        <input
          type="text"
          className="form-control form-control-sm mb-3"
          placeholder={t('editor.searchCategories')}
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
              {t(searchText ? 'editor.noMatchingCategories' : 'editor.noCategoriesAvailable')}
            </p>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) onAdd(selectedId);
          }}
        >
          {t('common.add')}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

// --- Main section ---

type CategoryModal = 'existing' | 'new' | null;

export default function PreparationCategoriesSection({
  product,
  preparationId,
  onChange,
}: PreparationCategoriesSectionProps) {
  const { t } = useTranslation();
  const { lookup } = useCategories();
  const preparations = product.preparations ?? [];
  const prep = preparations.find((p) => p.id === preparationId);
  const categoryIds = useMemo(() => prep?.categories ?? [], [prep?.categories]);

  const [modal, setModal] = useState<CategoryModal>(null);

  const categories = useMemo(
    () =>
      categoryIds
        .map((id) => {
          const cat = lookup.get(id);
          if (!cat) return null;
          const path = buildSlugPath(id, lookup);
          return { id, name: cat.displayName, path };
        })
        .filter((c): c is { id: string; name: string; path: string } => c !== null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categoryIds, lookup],
  );

  const excludedIds = useMemo(() => new Set(categoryIds), [categoryIds]);

  if (!prep) return null;

  function updateCategories(newCategoryIds: string[]) {
    const updatedProduct: ApiProduct = {
      ...product,
      preparations: preparations.map((p) =>
        p.id === preparationId ? { ...p, categories: newCategoryIds } : p,
      ),
    };
    onChange(updatedProduct);
  }

  function handleAddExisting(categoryId: string) {
    setModal(null);
    updateCategories([...categoryIds, categoryId]);
  }

  function handleRemove(categoryId: string) {
    updateCategories(categoryIds.filter((id) => id !== categoryId));
  }

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>{t('editor.categories')}</strong>
          <div className="dropdown">
            <button
              className="btn btn-dark btn-sm dropdown-toggle px-3"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {t('common.add')}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => setModal('existing')}
                >
                  <i className="bi bi-link-45deg me-2" aria-hidden="true" />
                  {t('editor.existingCategory')}
                </button>
              </li>
              <li>
                <button className="dropdown-item" type="button" onClick={() => setModal('new')}>
                  <i className="bi bi-plus-circle me-2" aria-hidden="true" />
                  {t('editor.newCategory')}
                </button>
              </li>
            </ul>
          </div>
        </div>
        {categories.length > 0 ? (
          <div className="list-group list-group-flush">
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
                <DeleteButton
                  ariaLabel={t('editor.removeItem', { name: c.name })}
                  onClick={() => handleRemove(c.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-body">
            <p className="text-body-secondary small mb-0">{t('editor.noCategories')}</p>
          </div>
        )}
      </div>

      {modal === 'existing' && (
        <CategoryPickerForPrep
          excludedIds={excludedIds}
          onAdd={handleAddExisting}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'new' && (
        <CreateCategoryModal onClose={() => setModal(null)} onSaved={() => setModal(null)} />
      )}
    </div>
  );
}
