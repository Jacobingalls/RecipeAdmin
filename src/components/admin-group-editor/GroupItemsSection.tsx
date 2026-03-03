import { useState, useMemo } from 'react';

import type { GroupItem, ProductGroupData } from '../../domain';
import { ProductGroup, ServingSize } from '../../domain';
import { formatSignificant } from '../../utils';
import {
  SectionHeader,
  Button,
  CircularButton,
  CircularButtonGroup,
  DeleteButton,
} from '../common';

import ItemModal from './ItemModal';

function formatItemServing(item: GroupItem): string {
  const ss = item.servingSize ? ServingSize.fromObject(item.servingSize) : null;
  if (!ss) return '1 serving';
  if (ss.type === 'servings') {
    return `${formatSignificant(ss.amount)} serving${ss.amount !== 1 ? 's' : ''}`;
  }
  if (ss.type === 'customSize') {
    const v = ss.value as { name: string; amount: number };
    return `${formatSignificant(v.amount)} ${v.name}`;
  }
  const v = ss.value as { amount: number; unit: string };
  return `${formatSignificant(v.amount)} ${v.unit}`;
}

function ItemRow({
  item,
  onEdit,
  onRemove,
}: {
  item: GroupItem;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const isProduct = !!item.product;
  const name = isProduct ? (item.product?.name ?? 'Product') : (item.group?.name ?? 'Group');
  const brand = isProduct ? item.product?.brand : item.group?.brand;
  const icon = isProduct ? 'bi-box-seam' : 'bi-collection';

  const calories = useMemo(() => {
    const serving = ProductGroup.getItemServing(item);
    return serving?.nutrition?.calories?.amount ?? null;
  }, [item]);

  return (
    <div className="list-group-item d-flex align-items-center gap-2">
      <i className={`bi ${icon} text-body-secondary`} aria-hidden="true" />
      <div className="flex-grow-1">
        <div className="fw-medium">{name}</div>
        <small className="text-body-secondary">
          {brand && <>{brand} &middot; </>}
          {formatItemServing(item)}
          {calories != null && <> &middot; {formatSignificant(calories)} cal</>}
        </small>
      </div>
      <CircularButtonGroup>
        <CircularButton aria-label={`Edit ${name}`} onClick={onEdit}>
          <i className="bi bi-pencil" aria-hidden="true" />
        </CircularButton>
        <DeleteButton ariaLabel={`Remove ${name}`} onClick={onRemove} />
      </CircularButtonGroup>
    </div>
  );
}

interface GroupItemsSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupItemsSection({ group, onChange }: GroupItemsSectionProps) {
  const items = group.items ?? [];
  const [modalState, setModalState] = useState<
    null | { mode: 'add' } | { mode: 'edit'; index: number }
  >(null);

  function handleSave(item: GroupItem) {
    if (modalState?.mode === 'edit') {
      const { index } = modalState;
      onChange({ ...group, items: items.map((it, i) => (i === index ? item : it)) });
    } else {
      onChange({ ...group, items: [...items, item] });
    }
    setModalState(null);
  }

  function handleRemove(index: number) {
    onChange({ ...group, items: items.filter((_, i) => i !== index) });
  }

  return (
    <>
      <SectionHeader title="Items" className="mt-5">
        <Button size="sm" variant="dark" onClick={() => setModalState({ mode: 'add' })}>
          Add
        </Button>
      </SectionHeader>
      {items.length > 0 ? (
        <div className="list-group">
          {items.map((item, i) => (
            <ItemRow
              // eslint-disable-next-line react/no-array-index-key -- Items lack stable unique keys
              key={i}
              item={item}
              onEdit={() => setModalState({ mode: 'edit', index: i })}
              onRemove={() => handleRemove(i)}
            />
          ))}
        </div>
      ) : (
        <p className="text-body-secondary small">No items</p>
      )}

      {modalState && (
        <ItemModal
          item={modalState.mode === 'edit' ? items[modalState.index] : undefined}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  );
}
