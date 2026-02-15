import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { ApiSearchResult } from '../api';
import { lookupBarcode } from '../api';
import { useApiQuery } from '../hooks';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import { LoadingState, ErrorState, ContentUnavailableView } from '../components/common';
import SearchResultRow from '../components/SearchResultRow';
import LogModal from '../components/LogModal';
import type { LogTarget } from '../components/LogModal';

export default function LookupPage() {
  const { barcode } = useParams<{ barcode: string }>();
  const navigate = useNavigate();
  const {
    data: results,
    loading,
    error,
  } = useApiQuery<ApiSearchResult[]>(() => lookupBarcode(barcode!), [barcode], {
    enabled: !!barcode,
    errorMessage: "Couldn't look up this barcode. Try again later.",
  });
  const [logItem, setLogItem] = useState<ApiSearchResult | null>(null);

  useEffect(() => {
    if (results?.length !== 1) return;
    const result = results[0];
    if (result.item.product?.id) {
      navigate(`/products/${result.item.product.id}`, { replace: true });
    } else if (result.item.group?.id) {
      navigate(`/groups/${result.item.group.id}`, { replace: true });
    }
  }, [results, navigate]);

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
