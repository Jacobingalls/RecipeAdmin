import type { Translations } from '../../types';
import type { enNav } from '../en/nav';

export const daNav: Translations<typeof enNav> = {
  'nav.brandHome': 'Recipe Admin startside',
  'nav.toggle': 'Skift navigation',
  'nav.home': 'Start',
  'nav.favorites': 'Favoritter',
  'nav.history': 'Historik',
  'nav.categories': 'Kategorier',
  'nav.search': 'Søg',
  'nav.searchPlaceholder': 'Søg...',
  'nav.userMenu': 'Brugermenu',
  'nav.settings': 'Indstillinger',
  'nav.admin': 'Admin',
  'nav.signOut': 'Log ud',

  'footer.api': 'API: {{url}}',

  'environment.unknown': 'Ukendt',
  'environment.development': 'Udvikling',
};
