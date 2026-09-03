import type { Translations } from '../../types';
import type { enNav } from '../en/nav';

export const svNav: Translations<typeof enNav> = {
  'nav.brandHome': 'Recipe Admin startsida',
  'nav.toggle': 'Växla navigering',
  'nav.home': 'Start',
  'nav.favorites': 'Favoriter',
  'nav.history': 'Historik',
  'nav.categories': 'Kategorier',
  'nav.search': 'Sök',
  'nav.searchPlaceholder': 'Sök...',
  'nav.userMenu': 'Användarmeny',
  'nav.settings': 'Inställningar',
  'nav.admin': 'Admin',
  'nav.signOut': 'Logga ut',

  'footer.api': 'API: {{url}}',

  'environment.unknown': 'Okänd',
  'environment.development': 'Utveckling',
};
