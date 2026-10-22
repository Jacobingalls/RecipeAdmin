import { useTranslation } from 'react-i18next';

import type { ApiCategorySearchResult, ApiSearchResult } from '../../api';
import { LoadingState, ErrorState, ContentUnavailableView, SubsectionTitle } from '../common';
import SearchResultRow from '../SearchResultRow';

import CategorySearchResults from './CategorySearchResults';

interface SearchResultsProps {
  results: ApiSearchResult[] | null;
  categories?: ApiCategorySearchResult[] | null;
  loading: boolean;
  error: string | null;
  query: string;
  onLog?: (result: ApiSearchResult) => void;
}

export default function SearchResults({
  results,
  categories,
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

  if (!results) return null;

  const matchedCategories = categories ?? [];
  if (results.length === 0 && matchedCategories.length === 0) {
    return (
      <ContentUnavailableView
        icon="bi-search"
        title={t('search.empty.title')}
        description={t('list.adjustSearch')}
      />
    );
  }

  return (
    <section aria-label={t('search.resultsLabel')}>
      {matchedCategories.length > 0 && <CategorySearchResults categories={matchedCategories} />}
      {results.length > 0 && (
        <section>
          {matchedCategories.length > 0 && <SubsectionTitle>{t('search.items')}</SubsectionTitle>}
          <div className="list-group">
            {results.map((result) => (
              <SearchResultRow
                key={result.item.product?.id ?? result.item.group?.id}
                result={result}
                onLog={onLog}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
