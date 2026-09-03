import type { enNav } from '../en/nav';

export const nlNav: Record<keyof typeof enNav, string> = {
  'nav.brandHome': 'Recipe Admin startpagina',
  'nav.toggle': 'Navigatie in- of uitklappen',
  'nav.home': 'Home',
  'nav.favorites': 'Favorieten',
  'nav.history': 'Geschiedenis',
  'nav.categories': 'Categorieën',
  'nav.search': 'Zoeken',
  'nav.searchPlaceholder': 'Zoeken...',
  'nav.userMenu': 'Gebruikersmenu',
  'nav.settings': 'Instellingen',
  'nav.admin': 'Beheer',
  'nav.signOut': 'Uitloggen',

  'footer.api': 'API: {{url}}',

  'environment.unknown': 'Onbekend',
  'environment.development': 'Ontwikkeling',
};
