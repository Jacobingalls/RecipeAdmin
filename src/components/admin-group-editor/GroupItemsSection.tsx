import { useState, useMemo } from 'react';

import type { GroupItem, ProductGroupData } from '../../domain';
import { ProductGroup, ServingSize } from '../../domain';
import { useTranslation } from '../../contexts/LocaleContext';
import { getTranslator } from '../../i18n';
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
  const { t, tPlural } = getTranslator();
  const ss = item.servingSize ? ServingSize.fromObject(item.servingSize) : null;
  if (!ss) return t('groupEditor.oneServing');
  if (ss.type === 'servings') {
    return tPlural('format.servings', ss.amount, { count: formatSignificant(ss.amount) });
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
  const { t } = useTranslation();
  const isProduct = !!item.product;
  const name = isProduct
    ? (item.product?.name ?? t('groupItem.product'))
    : (item.group?.name ?? t('groupItem.group'));
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
          {calories != null && (
            <> &middot; {t('groupEditor.calories', { amount: formatSignificant(calories) })}</>
          )}
        </small>
      </div>
      <CircularButtonGroup>
        <CircularButton aria-label={t('editor.editItem', { name })} onClick={onEdit}>
          <i className="bi bi-pencil" aria-hidden="true" />
        </CircularButton>
        <DeleteButton ariaLabel={t('editor.removeItem', { name })} onClick={onRemove} />
      </CircularButtonGroup>
    </div>
  );
}

interface GroupItemsSectionProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

export default function GroupItemsSection({ group, onChange }: GroupItemsSectionProps) {
  const { t } = useTranslation();
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
      <SectionHeader title={t('groupEditor.items')} className="mt-5">
        <Button size="sm" variant="dark" onClick={() => setModalState({ mode: 'add' })}>
          {t('common.add')}
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
        <p className="text-body-secondary small">{t('groupEditor.noItems')}</p>
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
