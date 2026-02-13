import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { ApiSearchResult } from '../api';
import { useSearch } from '../hooks';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import { ContentUnavailableView } from '../components/common';
import { SearchResults } from '../components/search';
import LogModal from '../components/LogModal';
import type { LogTarget } from '../components/LogModal';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { results, loading, error } = useSearch(query);
  const [logItem, setLogItem] = useState<ApiSearchResult | null>(null);

  const logTarget: LogTarget | null = useMemo(() => {
    if (!logItem) return null;

    const servingSize = ServingSize.fromObject(logItem.servingSize) || ServingSize.servings(1);

    if (logItem.item.product) {
      const p = logItem.item.product;
      const prepData =
        p.preparations?.find((pr) => pr.id === logItem.item.preparationID) || p.preparations?.[0];
      if (!prepData) return null;
      const prep = new Preparation(prepData);

      return {
        name: p.name,
        brand: p.brand,
        prepOrGroup: prep,
        initialServingSize: servingSize,
        productId: p.id,
        preparationId: prepData.id,
      };
    }

    if (logItem.item.group) {
      const g = logItem.item.group;
      const group = new ProductGroup(g);

      return {
        name: g.name || 'Group',
        prepOrGroup: group,
        initialServingSize: servingSize,
        groupId: g.id,
      };
    }

    return null;
  }, [logItem]);

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
