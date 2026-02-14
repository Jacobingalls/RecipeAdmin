import { useState, useCallback } from 'react';

import type { ServingSize } from '../domain';
import { createFavorite } from '../api';

import { Button } from './common';

interface AddToFavoritesButtonProps {
  productId?: string;
  groupId?: string;
  preparationId?: string;
  servingSize: ServingSize;
}

type FavoriteState = 'idle' | 'saving' | 'success';

export default function AddToFavoritesButton({
  productId,
  groupId,
  preparationId,
  servingSize,
}: AddToFavoritesButtonProps) {
  const [state, setState] = useState<FavoriteState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setState('saving');
    setError(null);

    try {
      await createFavorite(
        productId && preparationId
          ? {
              kind: 'product',
              productID: productId,
              preparationID: preparationId,
              servingSize: servingSize.toObject(),
            }
          : { kind: 'group', groupID: groupId!, servingSize: servingSize.toObject() },
      );
      setState('success');
      setTimeout(() => {
        setState('idle');
      }, 1500);
    } catch (e: unknown) {
      setError((e as Error).message);
      setState('idle');
    }
  }, [productId, groupId, preparationId, servingSize]);

  const variant = state === 'success' ? 'outline-success' : 'outline-secondary';
  const icon = state === 'success' ? 'bi-star-fill' : 'bi-star';
  const label = state === 'success' ? 'Favorited!' : 'Favorite';

  return (
    <div>
      <Button
        variant={variant}
        size="sm"
        onClick={handleClick}
        disabled={state === 'success'}
        loading={state === 'saving'}
      >
        <i className={`${icon} me-1`} /> {label}
      </Button>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
