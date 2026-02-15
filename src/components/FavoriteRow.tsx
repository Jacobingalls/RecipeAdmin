import { useNavigate } from 'react-router-dom';

import type { ApiFavorite } from '../api';
import {
  favoriteName,
  favoriteBrand,
  favoriteDetailPath,
  favoriteCalories,
  favoriteServingSizeDescription,
} from '../utils/favoriteHelpers';
import { formatRelativeTime } from '../utils/logEntryHelpers';

import { CircularButton, CircularButtonGroup, FoodItemRow, MoreButton } from './common';

interface FavoriteRowProps {
  favorite: ApiFavorite;
  onLog: (favorite: ApiFavorite) => void;
  onRemove: (favorite: ApiFavorite) => void;
  removeLoading: boolean;
}

export default function FavoriteRow({
  favorite,
  onLog,
  onRemove,
  removeLoading,
}: FavoriteRowProps) {
  const navigate = useNavigate();
  const name = favoriteName(favorite);
  const brand = favoriteBrand(favorite);
  const calories = favoriteCalories(favorite);
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
