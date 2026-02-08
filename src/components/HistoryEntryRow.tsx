import { useNavigate } from 'react-router-dom';

import type { ApiLogEntry } from '../api';
import {
  entryDetailPath,
  formatServingSizeDescription,
  formatRelativeTime,
} from '../utils/logEntryHelpers';

interface HistoryEntryRowProps {
  entry: ApiLogEntry;
  name: string;
  onEdit: (entry: ApiLogEntry) => void;
  editLoading: boolean;
}

export default function HistoryEntryRow({
  entry,
  name,
  onEdit,
  editLoading,
}: HistoryEntryRowProps) {
  const navigate = useNavigate();
  const detailPath = entryDetailPath(entry);

  return (
    <div
      role="button"
      tabIndex={0}
      className="list-group-item list-group-item-action"
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
            {formatServingSizeDescription(entry)} &mdash; {formatRelativeTime(entry.timestamp)}
          </small>
        </div>
        <div className="dropdown">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '2rem', height: '2rem' }}
            data-bs-toggle="dropdown"
            aria-label="Entry actions"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            &hellip;
          </button>
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
          </ul>
        </div>
      </div>
    </div>
  );
}
