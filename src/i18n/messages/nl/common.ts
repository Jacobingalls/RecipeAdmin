import type { enCommon } from '../en/common';

export const nlCommon: Record<keyof typeof enCommon, string> = {
  'common.loading': 'Laden',
  'common.loadingEllipsis': 'Laden...',
  'common.save': 'Opslaan',
  'common.cancel': 'Annuleren',
  'common.close': 'Sluiten',
  'common.delete': 'Verwijderen',
  'common.remove': 'Verwijderen',
  'common.add': 'Toevoegen',
  'common.done': 'Klaar',
  'common.copy': 'Kopiëren',
  'common.copied': 'Gekopieerd!',
  'common.tryAgain': 'Probeer het opnieuw',
  'common.moreActions': 'Meer acties',
  'common.name': 'Naam',
  'common.brand': 'Merk',
  'common.none': 'Geen',
  'common.unknown': 'Onbekend',
  'common.optional': 'Optioneel',

  'error.unexpected.title': 'Er is iets misgegaan',
  'error.unexpected.description': 'Er is een onverwachte fout opgetreden',

  'confirm.confirm': 'Bevestigen',
  'confirm.typeToConfirm': 'Typ <strong>{{name}}</strong> om te bevestigen',

  'filter.byName': 'Filter op naam',
  'filter.searchByName': 'Zoek op naam...',
  'filter.allBrands': 'Alle merken',

  'list.new': 'Nieuw',
  'list.adjustFilters': 'Pas je zoekopdracht of filters aan.',
  'list.adjustSearch': 'Pas je zoekopdracht aan.',

  'credential.created': 'Aangemaakt {{time}}',
  'credential.expires': 'Verloopt {{time}}',
  'credential.expired': 'Verlopen {{time}}',
  'credential.deletePasskey': 'Passkey {{name}} verwijderen',
  'credential.revokeApiKey': 'API-sleutel {{name}} intrekken',
};
