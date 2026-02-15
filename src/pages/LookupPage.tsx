import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { ApiSearchResult } from '../api';
import { lookupBarcode } from '../api';
import { useApiQuery } from '../hooks';
import { buildSearchResultLogTarget } from '../utils';
import { LoadingState, ErrorState, ContentUnavailableView } from '../components/common';
import SearchResultRow from '../components/SearchResultRow';
import LogModal from '../components/LogModal';

export default function LookupPage() {
  const { barcode } = useParams<{ barcode: string }>();
  const {
    data: results,
    loading,
    error,
  } = useApiQuery<ApiSearchResult[]>(() => lookupBarcode(barcode!), [barcode], {
    enabled: !!barcode,
    errorMessage: "Couldn't look up this barcode. Try again later.",
  });
  const [logItem, setLogItem] = useState<ApiSearchResult | null>(null);

  const logTarget = useMemo(
    () => (logItem ? buildSearchResultLogTarget(logItem) : null),
    [logItem],
  );

  return (
    <>
      <h1 className="mb-4">Lookup</h1>
      {!barcode && <div className="text-secondary">Enter a barcode in the search box above</div>}
      {barcode && (
        <p className="text-secondary mb-3">
          Results for: <code>{barcode}</code>
        </p>
      )}

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {results && results.length === 0 && (
        <ContentUnavailableView
          icon="bi-upc-scan"
          title="No results"
          description="No products or groups match this barcode. Check the number and try again."
        />
      )}
      {results && results.length > 0 && (
        <div className="list-group">
          {results.map((result) => (
            <SearchResultRow
              key={result.item.product?.id ?? result.item.group?.id}
              result={result}
              onLog={setLogItem}
            />
          ))}
        </div>
      )}

      <LogModal target={logTarget} onClose={() => setLogItem(null)} />
    </>
  );
}
