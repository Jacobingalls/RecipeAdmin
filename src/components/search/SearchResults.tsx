import { useTranslation } from 'react-i18next';

import type { ApiSearchResult } from '../../api';
import { LoadingState, ErrorState, ContentUnavailableView } from '../common';
import SearchResultRow from '../SearchResultRow';

interface SearchResultsProps {
  results: ApiSearchResult[] | null;
  loading: boolean;
  error: string | null;
  query: string;
  onLog?: (result: ApiSearchResult) => void;
}

export default function SearchResults({
  results,
  loading,
  error,
  query,
  onLog,
}: SearchResultsProps) {
  const { t } = useTranslation();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const trimmed = query.trim();
  if (trimmed.length < 2) return null;

  if (results && results.length === 0) {
    return (
      <ContentUnavailableView
        icon="bi-search"
        title={t('search.empty.title')}
        description={t('list.adjustSearch')}
      />
    );
  }

  if (!results) return null;

  return (
    <div className="list-group" role="region" aria-label={t('search.resultsLabel')}>
      {results.map((result) => (
        <SearchResultRow
          key={result.item.product?.id ?? result.item.group?.id}
          result={result}
          onLog={onLog}
        />
      ))}
    </div>
  );
}
