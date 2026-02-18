import { useNavigate } from 'react-router-dom';

import type { ApiFavorite, ApiProduct } from '../api';
import type { ProductGroupData } from '../domain';
import {
  favoriteName,
  favoriteBrand,
  favoriteDetailPath,
  favoriteCalories,
  favoriteServingSizeDescription,
  formatRelativeTime,
} from '../utils';

import { CircularButton, CircularButtonGroup, FoodItemRow, MoreButton } from './common';

interface FavoriteRowProps {
  favorite: ApiFavorite;
  products: Record<string, ApiProduct>;
  groups: Record<string, ProductGroupData>;
  onLog: (favorite: ApiFavorite) => void;
  onRemove: (favorite: ApiFavorite) => void;
  removeLoading: boolean;
}

export default function FavoriteRow({
  favorite,
  products,
  groups,
  onLog,
  onRemove,
  removeLoading,
}: FavoriteRowProps) {
  const navigate = useNavigate();
  const name = favoriteName(favorite, products, groups);
  const brand = favoriteBrand(favorite, products, groups);
  const calories = favoriteCalories(favorite, products, groups);
  const servingSizeDesc = favoriteServingSizeDescription(favorite);
  const detailPath = favoriteDetailPath(favorite);

  const subtitle = (
    <>
      {brand && <>{brand} &middot; </>}
      {servingSizeDesc}
      {servingSizeDesc && favorite.lastUsedAt > 0 && ' \u2014 '}
      {favorite.lastUsedAt > 0 && formatRelativeTime(favorite.lastUsedAt)}
    </>
  );

  return (
    <FoodItemRow
      name={name}
      subtitle={subtitle}
      calories={calories}
      ariaLabel={`View ${name}`}
      onClick={() => navigate(detailPath)}
    >
      <CircularButtonGroup>
        <CircularButton
          aria-label={`Log ${name}`}
          title="Add to log"
          onClick={(e) => {
            e.stopPropagation();
            onLog(favorite);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <i className="bi bi-plus-lg" aria-hidden="true" />
        </CircularButton>
        <div className="dropdown">
          <MoreButton ariaLabel={`${name} actions`} />
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                type="button"
                className="dropdown-item"
                disabled={removeLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(favorite);
                }}
              >
                Remove
              </button>
            </li>
          </ul>
        </div>
      </CircularButtonGroup>
    </FoodItemRow>
  );
}
