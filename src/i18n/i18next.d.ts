import 'i18next';

import type { en } from './messages/en';

/**
 * Types `t()` against the English catalog, so an unknown or misspelled message key is a
 * compile error rather than the key leaking into the interface at runtime.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    keySeparator: false;
    nsSeparator: false;
    resources: { translation: typeof en };
  }
}
