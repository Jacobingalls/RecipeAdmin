import { useNavigate } from 'react-router-dom';

import type { ApiLogEntry } from '../api';
import { formatSignificant } from '../utils/formatters';
import {
  entryDetailPath,
  formatServingSizeDescription,
  formatRelativeTime,
  formatTime,
} from '../utils/logEntryHelpers';

import { MoreButton } from './common';

interface HistoryEntryRowProps {
  entry: ApiLogEntry;
  name: string;
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
          <small className="text-body-secondary">
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
          <div className="dropdown">
            <MoreButton ariaLabel="Entry actions" />
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  disabled={logAgainLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogAgain(entry);
                  }}
                >
                  Log again
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
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
                  className="dropdown-item text-danger"
                  disabled={deleteLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry);
                  }}
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
