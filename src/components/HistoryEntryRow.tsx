import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiLogEntry } from '../api';
import { ServingSize } from '../domain';
import {
  entryDetailPath,
  formatServingSizeDescription,
  formatRelativeTime,
  formatTime,
} from '../utils';

import AddToFavoritesButton from './AddToFavoritesButton';
import { CircularButton, CircularButtonGroup, FoodItemRow, MoreButton } from './common';

interface HistoryEntryRowProps {
  entry: ApiLogEntry;
  name: string;
  brand?: string;
  calories: number | null;
  timeDisplay?: 'relative' | 'time';
  onLogAgain: (entry: ApiLogEntry) => void;
  logAgainLoading: boolean;
  onEdit: (entry: ApiLogEntry) => void;
  editLoading: boolean;
  onDelete: (entry: ApiLogEntry) => void;
  deleteLoading: boolean;
}

export default function HistoryEntryRow({
  entry,
  name,
  brand,
  calories,
  timeDisplay = 'relative',
  onLogAgain,
  logAgainLoading,
  onEdit,
  editLoading,
  onDelete,
  deleteLoading,
}: HistoryEntryRowProps) {
  const navigate = useNavigate();
  const detailPath = entryDetailPath(entry);

  const servingSize = useMemo(
    () => ServingSize.fromObject(entry.item.servingSize),
    [entry.item.servingSize],
  );

  const subtitle = (
    <>
      {brand && <>{brand} &middot; </>}
      {formatServingSizeDescription(entry)} &mdash;{' '}
      {timeDisplay === 'time' ? formatTime(entry.timestamp) : formatRelativeTime(entry.timestamp)}
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
          disabled={logAgainLoading}
          onClick={(e) => {
            e.stopPropagation();
            onLogAgain(entry);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {logAgainLoading ? (
            <span role="status">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span className="visually-hidden">Loading</span>
            </span>
          ) : (
            <i className="bi bi-plus-lg" aria-hidden="true" />
          )}
        </CircularButton>
        {servingSize && (
          <AddToFavoritesButton
            productId={entry.item.productID}
            groupId={entry.item.groupID}
            preparationId={entry.item.preparationID}
            servingSize={servingSize}
          />
        )}
        <div className="dropdown">
          <MoreButton ariaLabel="Entry actions" />
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                type="button"
                className="dropdown-item"
                disabled={editLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entry);
                }}
              >
                Edit
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item"
                disabled={deleteLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry);
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
