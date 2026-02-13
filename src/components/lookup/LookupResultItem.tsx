import type { ApiSearchResult } from '../../api';
import { ServingSize } from '../../domain';

import ProductCard from './ProductCard';
import GroupCard from './GroupCard';

interface LookupResultItemProps {
  result: ApiSearchResult;
  onLog?: (result: ApiSearchResult) => void;
}

export default function LookupResultItem({ result, onLog }: LookupResultItemProps) {
  const handleLog = onLog ? () => onLog(result) : undefined;
  const servingSize = ServingSize.fromObject(result.servingSize) || ServingSize.servings(1);

  if (result.item.product) {
    return <ProductCard item={result.item} servingSize={servingSize} onLog={handleLog} />;
  } else if (result.item.group) {
    return <GroupCard item={result.item} servingSize={servingSize} onLog={handleLog} />;
  }
  return null;
}
