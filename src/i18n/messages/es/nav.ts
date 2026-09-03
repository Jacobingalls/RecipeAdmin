import type { Translations } from '../../types';
import type { enNav } from '../en/nav';

export const esNav: Translations<typeof enNav> = {
  'nav.brandHome': 'Inicio de Recipe Admin',
  'nav.toggle': 'Mostrar u ocultar la navegación',
  'nav.home': 'Inicio',
  'nav.favorites': 'Favoritos',
  'nav.history': 'Historial',
  'nav.categories': 'Categorías',
  'nav.search': 'Buscar',
  'nav.searchPlaceholder': 'Buscar...',
  'nav.userMenu': 'Menú de usuario',
  'nav.settings': 'Ajustes',
  'nav.admin': 'Admin',
  'nav.signOut': 'Cerrar sesión',

  'footer.api': 'API: {{url}}',

  'environment.unknown': 'Desconocido',
  'environment.development': 'Desarrollo',
};
