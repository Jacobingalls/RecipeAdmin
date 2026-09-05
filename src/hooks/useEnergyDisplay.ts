import { useSyncExternalStore } from 'react';

import { getEnergyDisplay, subscribeEnergyDisplay } from '../utils';
import type { EnergyDisplay } from '../utils';

/**
 * The energy measure to render, re-rendering when the user picks another one or switches to
 * a language that reads energy differently.
 */
export function useEnergyDisplay(): EnergyDisplay {
  return useSyncExternalStore(subscribeEnergyDisplay, getEnergyDisplay, getEnergyDisplay);
}
