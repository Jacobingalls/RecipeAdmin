import { useNavigate } from 'react-router-dom';

import type { ApiFavorite } from '../api';
import { formatSignificant } from '../utils/formatters';
import {
  favoriteName,
  favoriteDetailPath,
  favoriteCalories,
  favoriteServingSizeDescription,
} from '../utils/favoriteHelpers';
import { formatRelativeTime } from '../utils/logEntryHelpers';

import { Button, MoreButton } from './common';

export type FavoriteLogState = 'idle' | 'logging' | 'success';

interface FavoriteRowProps {
  favorite: ApiFavorite;
  logState: FavoriteLogState;
  onLog: (favorite: ApiFavorite) => void;
  onLogWithSize: (favorite: ApiFavorite) => void;
  onRemove: (favorite: ApiFavorite) => void;
  removeLoading: boolean;
}

export default function FavoriteRow({
  favorite,
  logState,
  onLog,
  onLogWithSize,
  onRemove,
  removeLoading,
}: FavoriteRowProps) {
  const navigate = useNavigate();
  const name = favoriteName(favorite);
  const calories = favoriteCalories(favorite);
  const servingSizeDesc = favoriteServingSizeDescription(favorite);
  const detailPath = favoriteDetailPath(favorite);

  const isIdle = logState === 'idle';
  const isLogging = logState === 'logging';
  const isSuccess = logState === 'success';

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
          <Button
            variant={isSuccess ? 'outline-success' : 'outline-secondary'}
            size="sm"
            loading={isLogging}
            disabled={isSuccess}
            aria-label={`Log ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isIdle) onLog(favorite);
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {isSuccess ? 'Logged!' : 'Log'}
          </Button>
          <div className="dropdown">
            <MoreButton ariaLabel={`${name} actions`} />
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogWithSize(favorite);
                  }}
                >
                  Log with different size
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  type="button"
                  className="dropdown-item text-danger"
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
        </div>
      </div>
    </div>
  );
}
