import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { ApiSearchResult } from '../api';
import { useSearch } from '../hooks';
import { buildSearchResultLogTarget } from '../utils';
import { ContentUnavailableView } from '../components/common';
import { SearchResults } from '../components/search';
import LogModal from '../components/LogModal';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { results, loading, error } = useSearch(query);
  const [logItem, setLogItem] = useState<ApiSearchResult | null>(null);

  const logTarget = useMemo(
    () => (logItem ? buildSearchResultLogTarget(logItem) : null),
    [logItem],
  );

  if (!query) {
    return (
      <ContentUnavailableView
        icon="bi-search"
        title="Search products and groups"
        description="Use the search box above to get started."
      />
    );
  }

  return (
    <>
      <SearchResults
        results={results}
        loading={loading}
        error={error}
        query={query}
        onLog={setLogItem}
      />

      <LogModal target={logTarget} onClose={() => setLogItem(null)} />
    </>
  );
}
