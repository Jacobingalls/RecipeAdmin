import type { Translations } from '../../types';
import type { enFormats } from '../en/formats';

export const esFormats: Translations<typeof enFormats> = {
  'format.servings_one': '{{amount}} ración',
  'format.servings_other': '{{amount}} raciones',
  // A custom size name comes from the data, so it can't be pluralized reliably.
  'format.customSize_one': '{{amount}} {{name}}',
  'format.customSize_other': '{{amount}} {{name}}',

  'format.relative.justNow': 'ahora mismo',
  'format.relative.minutesAgo': 'hace {{amount}} min',
  'format.relative.hoursAgo': 'hace {{amount}} h',
  'format.relative.daysAgo': 'hace {{amount}} d',
  'format.relative.inMinutes': 'en {{amount}} min',
  'format.relative.inHours': 'en {{amount}} h',
  'format.relative.inDays': 'en {{amount}} d',

  'format.lastLogin.never': 'Nunca ha iniciado sesión',
  'format.lastLogin.justNow': 'Ahora mismo',
  'format.lastLogin.minutesAgo': 'Hace {{amount}} min',
  'format.lastLogin.hoursAgo': 'Hace {{amount}} h',
  'format.lastLogin.daysAgo': 'Hace {{amount}} d',

  'entry.unknownGroup': 'Grupo desconocido',
  'entry.unknownProduct': 'Producto desconocido',
  'entry.unknownItem': 'Elemento desconocido',
  'entry.group': 'Grupo',
  'favorite.unknown': 'Desconocido',
};
