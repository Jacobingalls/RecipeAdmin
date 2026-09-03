import type { enAdmin } from '../en/admin';

export const nlAdmin: Record<keyof typeof enAdmin, string> = {
  'admin.title': 'Beheer',
  'admin.nav.products': 'Producten',
  'admin.nav.groups': 'Groepen',
  'admin.nav.categories': 'Categorieën',
  'admin.nav.users': 'Gebruikers',

  'adminProducts.title': 'Producten',
  'adminProducts.error': 'We konden de producten niet laden. Probeer het later opnieuw.',
  'adminProducts.empty.title': 'Geen producten',

  'adminGroups.title': 'Groepen',
  'adminGroups.error': 'We konden de groepen niet laden. Probeer het later opnieuw.',
  'adminGroups.empty.title': 'Geen groepen',
  'adminGroups.itemCount_one': '{{count}} item',
  'adminGroups.itemCount_other': '{{count}} items',

  'adminCategories.title': 'Categorieën',
  'adminCategories.error': 'We konden de categorieën niet laden. Probeer het later opnieuw.',
  'adminCategories.empty.title': 'Geen categorieën',

  'adminUsers.title': 'Gebruikers',
  'adminUsers.error': 'We konden de gebruikers niet laden. Probeer het later opnieuw.',
  'adminUsers.empty.title': 'Geen gebruikers',
  'adminUsers.searchLabel': 'Gebruikers zoeken',
  'adminUsers.searchPlaceholder': 'Zoek gebruikers...',
  'adminUsers.allUsers': 'Alle gebruikers',
  'adminUsers.role.admins': 'Beheerders',
  'adminUsers.role.normal': 'Gewone gebruikers',

  'createProduct.title': 'Product toevoegen',
  'createProduct.error': 'Het aanmaken van het product is niet gelukt. Probeer het opnieuw.',

  'createGroup.title': 'Groep toevoegen',
  'createGroup.error': 'Het aanmaken van de groep is niet gelukt. Probeer het opnieuw.',

  'createUser.title': 'Gebruiker toevoegen',
  'createUser.created': 'Gebruiker aangemaakt',
  'createUser.tempKeyNotice':
    'Tijdelijke API-sleutel voor <strong>{{name}}</strong>. Bewaar hem nu — hij verloopt over 24 uur en is later niet meer op te vragen.',
  'createUser.username': 'Gebruikersnaam',
  'createUser.displayName': 'Weergavenaam',
  'createUser.email': 'E-mailadres',
  'createUser.administrator': 'Beheerder',
  'createUser.error': 'Het aanmaken van de gebruiker is niet gelukt. Probeer het opnieuw.',
};
