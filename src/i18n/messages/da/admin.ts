import type { Translations } from '../../types';
import type { enAdmin } from '../en/admin';

export const daAdmin: Translations<typeof enAdmin> = {
  'admin.title': 'Admin',
  'admin.nav.products': 'Produkter',
  'admin.nav.groups': 'Grupper',
  'admin.nav.categories': 'Kategorier',
  'admin.nav.users': 'Brugere',

  'adminProducts.title': 'Produkter',
  'adminProducts.error': 'Vi kunne ikke indlæse produkterne. Prøv igen senere.',
  'adminProducts.empty.title': 'Ingen produkter',

  'adminGroups.title': 'Grupper',
  'adminGroups.error': 'Vi kunne ikke indlæse grupperne. Prøv igen senere.',
  'adminGroups.empty.title': 'Ingen grupper',
  'adminGroups.itemCount_one': '{{count}} element',
  'adminGroups.itemCount_other': '{{count}} elementer',

  'adminCategories.title': 'Kategorier',
  'adminCategories.error': 'Vi kunne ikke indlæse kategorierne. Prøv igen senere.',
  'adminCategories.empty.title': 'Ingen kategorier',

  'adminUsers.title': 'Brugere',
  'adminUsers.error': 'Vi kunne ikke indlæse brugerne. Prøv igen senere.',
  'adminUsers.empty.title': 'Ingen brugere',
  'adminUsers.searchLabel': 'Søg efter brugere',
  'adminUsers.searchPlaceholder': 'Søg efter brugere...',
  'adminUsers.allUsers': 'Alle brugere',
  'adminUsers.role.admins': 'Administratorer',
  'adminUsers.role.normal': 'Almindelige brugere',

  'createProduct.title': 'Tilføj produkt',
  'createProduct.error': 'Vi kunne ikke oprette produktet. Prøv igen.',

  'createGroup.title': 'Tilføj gruppe',
  'createGroup.error': 'Vi kunne ikke oprette gruppen. Prøv igen.',

  'createUser.title': 'Tilføj bruger',
  'createUser.created': 'Brugeren er oprettet',
  'createUser.tempKeyNotice':
    'Midlertidig API-nøgle til <strong>{{name}}</strong>. Gem den nu — den udløber om 24 timer og kan ikke hentes igen.',
  'createUser.username': 'Brugernavn',
  'createUser.displayName': 'Vist navn',
  'createUser.email': 'E-mail',
  'createUser.administrator': 'Administrator',
  'createUser.error': 'Vi kunne ikke oprette brugeren. Prøv igen.',
};
