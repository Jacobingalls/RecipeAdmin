import type { NutritionInformation, Preparation, ProductGroup, ServingSize } from '../domain';
import { useNutritionLabelStyle } from '../hooks';

import EuropeanNutritionLabel from './EuropeanNutritionLabel';
import USNutritionLabel from './USNutritionLabel';

interface NutritionLabelProps {
  nutritionInfo: NutritionInformation | null;
  servingSize: ServingSize;
  prep: Preparation | ProductGroup;
}

/**
 * A product's nutrition, labelled the way the reader expects it.
 *
 * The two conventions differ in what they declare, not only in units, so each has its own
 * component: US readers get the FDA facts panel, European readers the per-100 declaration
 * required by Regulation (EU) No 1169/2011.
 */
export default function NutritionLabel(props: NutritionLabelProps) {
  const style = useNutritionLabelStyle();

  return style === 'european' ? (
    <EuropeanNutritionLabel {...props} />
  ) : (
    <USNutritionLabel {...props} />
  );
}
