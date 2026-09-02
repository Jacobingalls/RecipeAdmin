import type { enFormats } from '../en/formats';

export const nlFormats: Record<keyof typeof enFormats, string> = {
  'format.servings.one': '{count} portie',
  'format.servings.other': '{count} porties',
  // A custom size name comes from the data, so it can't be pluralized reliably.
  'format.customSize.one': '{count} {name}',
  'format.customSize.other': '{count} {name}',

  'format.relative.justNow': 'zojuist',
  'format.relative.minutesAgo': '{count} min geleden',
  'format.relative.hoursAgo': '{count} u geleden',
  'format.relative.daysAgo': '{count} d geleden',
  'format.relative.inMinutes': 'over {count} min',
  'format.relative.inHours': 'over {count} u',
  'format.relative.inDays': 'over {count} d',

  'format.lastLogin.never': 'Nooit ingelogd',
  'format.lastLogin.justNow': 'Zojuist',
  'format.lastLogin.minutesAgo': '{count} min geleden',
  'format.lastLogin.hoursAgo': '{count} u geleden',
  'format.lastLogin.daysAgo': '{count} d geleden',

  'entry.unknownGroup': 'Onbekende groep',
  'entry.unknownProduct': 'Onbekend product',
  'entry.unknownItem': 'Onbekend item',
  'entry.group': 'Groep',
  'favorite.unknown': 'Onbekend',
};
