import { Link } from 'react-router-dom';

import { getLogs, listProducts, listGroups } from '../../api';
import { useApiQuery } from '../../hooks';
import {
  formatRelativeTime,
  resolveEntryName,
  entryDetailPath,
  formatServingSizeDescription,
} from '../../utils/logEntryHelpers';
import { LoadingState, ErrorState, EmptyState } from '../common';

import Tile from './Tile';

export default function HistoryTile() {
  const { data: logs, loading: logsLoading, error: logsError } = useApiQuery(getLogs, []);
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useApiQuery(listProducts, []);
  const { data: groups, loading: groupsLoading, error: groupsError } = useApiQuery(listGroups, []);

  const loading = logsLoading || productsLoading || groupsLoading;
  const error = logsError || productsError || groupsError;

  let content;
  if (loading) {
    content = <LoadingState />;
  } else if (error) {
    content = <ErrorState message={error} />;
  } else if (!logs || logs.length === 0) {
    content = <EmptyState message="No recent log entries" />;
  } else {
    content = (
      <ul className="list-group list-group-flush">
        {logs.map((entry) => (
          <li key={entry.id} className="list-group-item px-0">
            <Link to={entryDetailPath(entry)} className="text-decoration-none">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-medium">{resolveEntryName(entry, products!, groups!)}</div>
                  <small className="text-body-secondary">
                    {formatServingSizeDescription(entry)}
                  </small>
                </div>
                <small className="text-body-secondary text-nowrap ms-2">
                  {formatRelativeTime(entry.timestamp)}
                </small>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Tile title="History">
      {content}
      <div className="text-end mt-2">
        <Link to="/history" className="text-decoration-none small">
          View all &rarr;
        </Link>
      </div>
    </Tile>
  );
}
