import { useSyncExternalStore } from 'react';

import { getLabelStyle, subscribeLabelStyle } from '../utils';
import type { LabelStyle } from '../utils';

/**
 * The labelling convention to render, re-rendering when the user picks another one or switches
 * to a language that labels food differently.
 */
export function useNutritionLabelStyle(): LabelStyle {
  return useSyncExternalStore(subscribeLabelStyle, getLabelStyle, getLabelStyle);
}
