import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiLogEntry } from '../api';
import { ServingSize } from '../domain';
import { formatSignificant } from '../utils/formatters';
import {
  entryDetailPath,
  formatServingSizeDescription,
  formatRelativeTime,
  formatTime,
} from '../utils/logEntryHelpers';

import AddToFavoritesButton from './AddToFavoritesButton';
import { CircularButton, CircularButtonGroup, MoreButton } from './common';

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
        <div>
          <div className="fw-medium">{name}</div>
          <small className="text-secondary">
            {brand && <>{brand} &middot; </>}
            {formatServingSizeDescription(entry)} &mdash;{' '}
            {timeDisplay === 'time'
              ? formatTime(entry.timestamp)
              : formatRelativeTime(entry.timestamp)}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="text-nowrap text-body-secondary small fw-medium">
            {calories !== null ? `${formatSignificant(calories)} kcal` : '-- kcal'}
          </div>
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
        </div>
      </div>
    </div>
  );
}
