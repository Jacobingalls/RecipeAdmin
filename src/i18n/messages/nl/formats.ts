import type { enFormats } from '../en/formats';

export const nlFormats: Record<keyof typeof enFormats, string> = {
  'format.servings_one': '{{amount}} portie',
  'format.servings_other': '{{amount}} porties',
  // A custom size name comes from the data, so it can't be pluralized reliably.
  'format.customSize_one': '{{amount}} {{name}}',
  'format.customSize_other': '{{amount}} {{name}}',

  'format.relative.justNow': 'zojuist',
  'format.relative.minutesAgo': '{{amount}} min geleden',
  'format.relative.hoursAgo': '{{amount}} u geleden',
  'format.relative.daysAgo': '{{amount}} d geleden',
  'format.relative.inMinutes': 'over {{amount}} min',
  'format.relative.inHours': 'over {{amount}} u',
  'format.relative.inDays': 'over {{amount}} d',

  'format.lastLogin.never': 'Nooit ingelogd',
  'format.lastLogin.justNow': 'Zojuist',
  'format.lastLogin.minutesAgo': '{{amount}} min geleden',
  'format.lastLogin.hoursAgo': '{{amount}} u geleden',
  'format.lastLogin.daysAgo': '{{amount}} d geleden',

  'entry.unknownGroup': 'Onbekende groep',
  'entry.unknownProduct': 'Onbekend product',
  'entry.unknownItem': 'Onbekend item',
  'entry.group': 'Groep',
  'favorite.unknown': 'Onbekend',
};
