import type { Translations } from '../../types';
import type { enFormats } from '../en/formats';

export const daFormats: Translations<typeof enFormats> = {
  'format.servings_one': '{{amount}} portion',
  'format.servings_other': '{{amount}} portioner',
  // A custom size name comes from the data, so it can't be pluralized reliably.
  'format.customSize_one': '{{amount}} {{name}}',
  'format.customSize_other': '{{amount}} {{name}}',

  'format.relative.justNow': 'lige nu',
  'format.relative.minutesAgo': 'for {{amount}} min siden',
  'format.relative.hoursAgo': 'for {{amount}} t siden',
  'format.relative.daysAgo': 'for {{amount}} d siden',
  'format.relative.inMinutes': 'om {{amount}} min',
  'format.relative.inHours': 'om {{amount}} t',
  'format.relative.inDays': 'om {{amount}} d',

  'format.lastLogin.never': 'Har aldrig logget ind',
  'format.lastLogin.justNow': 'Lige nu',
  'format.lastLogin.minutesAgo': 'For {{amount}} min siden',
  'format.lastLogin.hoursAgo': 'For {{amount}} t siden',
  'format.lastLogin.daysAgo': 'For {{amount}} d siden',

  'entry.unknownGroup': 'Ukendt gruppe',
  'entry.unknownProduct': 'Ukendt produkt',
  'entry.unknownItem': 'Ukendt element',
  'entry.group': 'Gruppe',
  'favorite.unknown': 'Ukendt',
};
