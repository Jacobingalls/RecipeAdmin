import type { ApiLookupItem } from '../../api';

import ProductCard from './ProductCard';
import GroupCard from './GroupCard';

interface LookupResultItemProps {
  item: ApiLookupItem;
  barcode?: string;
}

export default function LookupResultItem({ item, barcode }: LookupResultItemProps) {
  if (item.product) {
    return <ProductCard item={item} barcode={barcode} />;
  } else if (item.group) {
    return <GroupCard item={item} barcode={barcode} />;
  }
  return null;
}
