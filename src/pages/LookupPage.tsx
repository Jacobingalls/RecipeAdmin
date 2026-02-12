import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { ApiLookupItem } from '../api';
import { lookupBarcode } from '../api';
import { useApiQuery } from '../hooks';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import { LoadingState, ErrorState, ContentUnavailableView } from '../components/common';
import { LookupResultItem } from '../components/lookup';
import LogModal from '../components/LogModal';
import type { LogTarget } from '../components/LogModal';

export default function LookupPage() {
  const { barcode } = useParams<{ barcode: string }>();
  const navigate = useNavigate();
  const {
    data: results,
    loading,
    error,
  } = useApiQuery<ApiLookupItem[]>(() => lookupBarcode(barcode!), [barcode], {
    enabled: !!barcode,
    errorMessage: "Couldn't look up this barcode. Try again later.",
  });
  const [logItem, setLogItem] = useState<ApiLookupItem | null>(null);

  useEffect(() => {
    if (results?.length !== 1) return;
    const item = results[0];
    if (item.product?.id) {
      navigate(`/products/${item.product.id}`, { replace: true });
    } else if (item.group?.id) {
      navigate(`/groups/${item.group.id}`, { replace: true });
    }
  }, [results, navigate]);

  const logTarget: LogTarget | null = useMemo(() => {
    if (!logItem) return null;

    if (logItem.product) {
      const p = logItem.product;
      const prepData =
        p.preparations?.find((pr) => pr.id === logItem.preparationID) || p.preparations?.[0];
      if (!prepData) return null;
      const prep = new Preparation(prepData);

      const matchingBarcode = barcode ? p.barcodes?.find((bc) => bc.code === barcode) : null;
      const servingSize = matchingBarcode?.servingSize
        ? ServingSize.fromObject(matchingBarcode.servingSize) || ServingSize.servings(1)
        : ServingSize.servings(1);

      return {
        name: p.name,
        brand: p.brand,
        prepOrGroup: prep,
        initialServingSize: servingSize,
        productId: p.id,
        preparationId: prepData.id,
      };
    }

    if (logItem.group) {
      const g = logItem.group;
      const group = new ProductGroup(g);

      const matchingBarcode = barcode ? g.barcodes?.find((bc) => bc.code === barcode) : null;
      const servingSize = matchingBarcode?.servingSize
        ? ServingSize.fromObject(matchingBarcode.servingSize) || ServingSize.servings(1)
        : ServingSize.servings(1);

      return {
        name: g.name || 'Group',
        prepOrGroup: group,
        initialServingSize: servingSize,
        groupId: g.id,
      };
    }

    return null;
  }, [logItem, barcode]);

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
        <div>
          {results.map((item) => (
            <LookupResultItem
              key={item.product?.id ?? item.group?.id}
              item={item}
              barcode={barcode}
              onLog={setLogItem}
            />
          ))}
        </div>
      )}

      <LogModal target={logTarget} onClose={() => setLogItem(null)} />
    </>
  );
}
