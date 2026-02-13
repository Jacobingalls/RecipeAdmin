import type { ApiSearchResult } from '../../api';
import { LoadingState, ErrorState, ContentUnavailableView } from '../common';
import { LookupResultItem } from '../lookup';

interface SearchResultsProps {
  results: ApiSearchResult[] | null;
  loading: boolean;
  error: string | null;
  query: string;
  onLog?: (result: ApiSearchResult) => void;
}

/**
 * Renders a list of search results using LookupResultItem cards.
 * Handles loading, error, and empty states. Designed for reuse in
 * both full-page search and smaller popover contexts.
 */
export default function SearchResults({
  results,
  loading,
  error,
  query,
  onLog,
}: SearchResultsProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const trimmed = query.trim();
  if (trimmed.length < 2) return null;

  if (results && results.length === 0) {
    return (
      <ContentUnavailableView
        icon="bi-search"
        title="No results"
        description="Try adjusting your search."
      />
    );
  }

  if (!results) return null;

  return (
    <div role="region" aria-label="Search results">
      {results.map((result) => (
        <LookupResultItem
          key={result.item.product?.id ?? result.item.group?.id}
          result={result}
          onLog={onLog}
        />
      ))}
    </div>
  );
}
