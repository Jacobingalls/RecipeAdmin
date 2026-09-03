import type { Translations } from '../../types';
import type { enFormats } from '../en/formats';

export const svFormats: Translations<typeof enFormats> = {
  'format.servings_one': '{{amount}} portion',
  'format.servings_other': '{{amount}} portioner',
  // A custom size name comes from the data, so it can't be pluralized reliably.
  'format.customSize_one': '{{amount}} {{name}}',
  'format.customSize_other': '{{amount}} {{name}}',

  'format.relative.justNow': 'nyss',
  'format.relative.minutesAgo': 'för {{amount}} min sedan',
  'format.relative.hoursAgo': 'för {{amount}} tim sedan',
  'format.relative.daysAgo': 'för {{amount}} d sedan',
  'format.relative.inMinutes': 'om {{amount}} min',
  'format.relative.inHours': 'om {{amount}} tim',
  'format.relative.inDays': 'om {{amount}} d',

  'format.lastLogin.never': 'Har aldrig loggat in',
  'format.lastLogin.justNow': 'Nyss',
  'format.lastLogin.minutesAgo': 'För {{amount}} min sedan',
  'format.lastLogin.hoursAgo': 'För {{amount}} tim sedan',
  'format.lastLogin.daysAgo': 'För {{amount}} d sedan',

  'entry.unknownGroup': 'Okänd grupp',
  'entry.unknownProduct': 'Okänd produkt',
  'entry.unknownItem': 'Okänt objekt',
  'entry.group': 'Grupp',
  'favorite.unknown': 'Okänd',
};
