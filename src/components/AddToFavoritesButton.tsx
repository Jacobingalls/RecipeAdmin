import { useState, useCallback, useMemo } from 'react';

import type { ServingSize } from '../domain';
import { useFavorites } from '../contexts/FavoritesContext';

import { CircularButton } from './common';

interface AddToFavoritesButtonProps {
  productId?: string;
  groupId?: string;
  preparationId?: string;
  servingSize: ServingSize;
}

export default function AddToFavoritesButton({
  productId,
  groupId,
  preparationId,
  servingSize,
}: AddToFavoritesButtonProps) {
  const { findFavorite, addFavorite, removeFavorite } = useFavorites();
  const [saving, setSaving] = useState(false);

  const servingSizeData = useMemo(() => servingSize.toObject(), [servingSize]);

  const existing = findFavorite({
    productId,
    preparationId,
    groupId,
    servingSize: servingSizeData,
  });

  const isFavorited = existing !== null;

  const handleClick = useCallback(async () => {
    setSaving(true);

    try {
      if (isFavorited) {
        await removeFavorite(existing!.id);
      } else {
        const request =
          productId && preparationId
            ? {
                kind: 'product' as const,
                productID: productId,
                preparationID: preparationId,
                servingSize: servingSizeData,
              }
            : { kind: 'group' as const, groupID: groupId!, servingSize: servingSizeData };
        await addFavorite(request);
      }
    } catch {
      // Errors are non-critical for the compact toggle
    } finally {
      setSaving(false);
    }
  }, [
    isFavorited,
    existing,
    productId,
    groupId,
    preparationId,
    servingSizeData,
    addFavorite,
    removeFavorite,
  ]);

  const icon = isFavorited ? 'bi-star-fill' : 'bi-star';
  const label = isFavorited ? 'Remove from favorites' : 'Add to favorites';

  return (
    <CircularButton
      aria-label={label}
      title={label}
      disabled={saving}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {saving ? (
        <span role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span className="visually-hidden">Loading</span>
        </span>
      ) : (
        <i className={`bi ${icon}${isFavorited ? ' text-warning' : ''}`} aria-hidden="true" />
      )}
    </CircularButton>
  );
}
