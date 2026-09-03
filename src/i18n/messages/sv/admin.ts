import type { Translations } from '../../types';
import type { enAdmin } from '../en/admin';

export const svAdmin: Translations<typeof enAdmin> = {
  'admin.title': 'Admin',
  'admin.nav.products': 'Produkter',
  'admin.nav.groups': 'Grupper',
  'admin.nav.categories': 'Kategorier',
  'admin.nav.users': 'Användare',

  'adminProducts.title': 'Produkter',
  'adminProducts.error': 'Vi kunde inte ladda produkterna. Försök igen senare.',
  'adminProducts.empty.title': 'Inga produkter',

  'adminGroups.title': 'Grupper',
  'adminGroups.error': 'Vi kunde inte ladda grupperna. Försök igen senare.',
  'adminGroups.empty.title': 'Inga grupper',
  'adminGroups.itemCount_one': '{{count}} objekt',
  'adminGroups.itemCount_other': '{{count}} objekt',

  'adminCategories.title': 'Kategorier',
  'adminCategories.error': 'Vi kunde inte ladda kategorierna. Försök igen senare.',
  'adminCategories.empty.title': 'Inga kategorier',

  'adminUsers.title': 'Användare',
  'adminUsers.error': 'Vi kunde inte ladda användarna. Försök igen senare.',
  'adminUsers.empty.title': 'Inga användare',
  'adminUsers.searchLabel': 'Sök användare',
  'adminUsers.searchPlaceholder': 'Sök användare...',
  'adminUsers.allUsers': 'Alla användare',
  'adminUsers.role.admins': 'Administratörer',
  'adminUsers.role.normal': 'Vanliga användare',

  'createProduct.title': 'Lägg till produkt',
  'createProduct.error': 'Vi kunde inte skapa produkten. Försök igen.',

  'createGroup.title': 'Lägg till grupp',
  'createGroup.error': 'Vi kunde inte skapa gruppen. Försök igen.',

  'createUser.title': 'Lägg till användare',
  'createUser.created': 'Användaren är skapad',
  'createUser.tempKeyNotice':
    'Tillfällig API-nyckel för <strong>{{name}}</strong>. Spara den nu — den går ut om 24 timmar och går inte att hämta igen.',
  'createUser.username': 'Användarnamn',
  'createUser.displayName': 'Visningsnamn',
  'createUser.email': 'E-post',
  'createUser.administrator': 'Administratör',
  'createUser.error': 'Vi kunde inte skapa användaren. Försök igen.',
};
