import type { Locale } from '../types';

import { en } from './en';
import type { Messages } from './en';
import { nl } from './nl';

/** Every shipped translation, keyed by language. */
export const messages: Record<Locale, Messages> = { en, nl };
