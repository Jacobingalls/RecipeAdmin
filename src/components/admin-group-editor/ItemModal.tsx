import { useState, useId, useCallback, useRef, useEffect, type RefCallback } from 'react';

import type { ApiProduct, ApiSearchResult } from '../../api';
import { searchItems } from '../../api';
import type { GroupItem, ProductGroupData } from '../../domain';
import { ServingSize } from '../../domain';
import { Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';

import SelectedItemConfig from './SelectedItemConfig';

interface ItemModalProps {
  item?: GroupItem;
  onSave: (item: GroupItem) => void;
  onClose: () => void;
}

interface Selection {
  product?: ApiProduct;
  group?: ProductGroupData;
}

function selectionFromItem(item: GroupItem): Selection | null {
  if (item.product) return { product: item.product as ApiProduct };
  if (item.group) return { group: item.group };
  return null;
}

export default function ItemModal({ item, onSave, onClose }: ItemModalProps) {
  const titleId = useId();
  const isEditMode = !!item;

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef: RefCallback<HTMLInputElement> = useCallback((el) => el?.focus(), []);

  // Selection state
  const [selection, setSelection] = useState<Selection | null>(
    item ? selectionFromItem(item) : null,
  );

  // Config state
  const [servingSize, setServingSize] = useState<ServingSize>(
    item?.servingSize
      ? (ServingSize.fromObject(item.servingSize) ?? ServingSize.servings(1))
      : ServingSize.servings(1),
  );
  const [prepId, setPrepId] = useState<string | undefined>(item?.preparationID);

  const doSearch = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await searchItems(text.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  function handleSelect(result: ApiSearchResult) {
    const { item: resultItem } = result;
    const newSelection: Selection = {};
    if (resultItem.product) {
      newSelection.product = resultItem.product;
    } else if (resultItem.group) {
      newSelection.group = resultItem.group;
    }
    setSelection(newSelection);

    const defaultServing = result.servingSize
      ? (ServingSize.fromObject(result.servingSize) ?? ServingSize.servings(1))
      : ServingSize.servings(1);
    setServingSize(defaultServing);
    setPrepId(resultItem.preparationID ?? resultItem.product?.preparations?.[0]?.id);

    setQuery('');
    setResults([]);
  }

  function handleClearSelection() {
    setSelection(null);
    setServingSize(ServingSize.servings(1));
    setPrepId(undefined);
  }

  function handleSave() {
    if (!selection) return;
    const newItem: GroupItem = { servingSize: servingSize.toApiObject() };
    if (selection.product) {
      newItem.product = selection.product;
      newItem.preparationID = prepId;
    } else if (selection.group) {
      newItem.group = selection.group;
    }
    onSave(newItem);
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId} scrollable>
      <ModalHeader onClose={onClose} titleId={titleId}>
        {isEditMode ? 'Edit item' : 'Add item'}
      </ModalHeader>
      <ModalBody>
        <input
          type="text"
          className="form-control form-control-sm mb-3"
          placeholder="Search products and groups..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputRef}
        />
        {searching && <p className="text-body-secondary small">Searching...</p>}
        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-body-secondary small">No results</p>
        )}
        {results.length > 0 && (
          <div className="list-group mb-3" style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {results.map((r) => {
              const isProduct = !!r.item.product;
              const name = isProduct
                ? (r.item.product?.name ?? 'Product')
                : (r.item.group?.name ?? 'Group');
              const brand = isProduct ? r.item.product?.brand : r.item.group?.brand;
              const icon = isProduct ? 'bi-box-seam' : 'bi-collection';
              const id = isProduct ? r.item.product?.id : r.item.group?.id;
              return (
                <button
                  key={id}
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                  onClick={() => handleSelect(r)}
                >
                  <i className={`bi ${icon} text-body-secondary`} aria-hidden="true" />
                  <div>
                    <span className="fw-medium">{name}</span>
                    {brand && <small className="text-body-secondary ms-2">{brand}</small>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selection && (
          <SelectedItemConfig
            product={selection.product}
            group={selection.group}
            prepId={prepId}
            onPrepChange={setPrepId}
            servingSize={servingSize}
            onServingSizeChange={setServingSize}
            onClear={handleClearSelection}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!selection}>
          {isEditMode ? 'Save' : 'Add'}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
