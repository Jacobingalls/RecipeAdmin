import type { Locale } from '../locales';

import { da } from './da';
import { en } from './en';
import type { Messages } from './en';
import { es } from './es';
import { nl } from './nl';
import { sv } from './sv';

/** Every shipped translation, keyed by language. */
export const messages: Record<Locale, Messages> = { en, da, es, nl, sv };
