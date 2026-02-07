import type { ApiLookupItem } from '../../api';

import ProductCard from './ProductCard';
import GroupCard from './GroupCard';

interface LookupResultItemProps {
  item: ApiLookupItem;
  barcode?: string;
  onLog?: (item: ApiLookupItem) => void;
}

export default function LookupResultItem({ item, barcode, onLog }: LookupResultItemProps) {
  const handleLog = onLog ? () => onLog(item) : undefined;

  if (item.product) {
    return <ProductCard item={item} barcode={barcode} onLog={handleLog} />;
  } else if (item.group) {
    return <GroupCard item={item} barcode={barcode} onLog={handleLog} />;
  }
  return null;
}
