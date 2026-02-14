import { useNavigate } from 'react-router-dom';

import type { ApiFavorite } from '../api';
import { formatSignificant } from '../utils/formatters';
import {
  favoriteName,
  favoriteBrand,
  favoriteDetailPath,
  favoriteCalories,
  favoriteServingSizeDescription,
} from '../utils/favoriteHelpers';
import { formatRelativeTime } from '../utils/logEntryHelpers';

import { CircularButton, CircularButtonGroup, MoreButton } from './common';

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

  return (
    <div
      role="button"
      tabIndex={0}
      className="list-group-item list-group-item-action"
      aria-label={`View ${name}`}
      onClick={() => navigate(detailPath)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(detailPath);
        }
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="me-3 min-width-0">
          <div className="fw-medium text-truncate">{name}</div>
          <small className="text-body-secondary">
            {brand && <>{brand} &middot; </>}
            {servingSizeDesc}
            {servingSizeDesc && favorite.lastUsedAt > 0 && ' \u2014 '}
            {favorite.lastUsedAt > 0 && formatRelativeTime(favorite.lastUsedAt)}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {calories !== null && (
            <span className="text-nowrap text-body-secondary small fw-medium">
              {formatSignificant(calories)} kcal
            </span>
          )}
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
        </div>
      </div>
    </div>
  );
}
