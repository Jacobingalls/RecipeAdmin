import type { Translations } from '../../types';
import type { enCommon } from '../en/common';

export const daCommon: Translations<typeof enCommon> = {
  'common.loading': 'Indlæser',
  'common.loadingEllipsis': 'Indlæser...',
  'common.save': 'Gem',
  'common.cancel': 'Annuller',
  'common.close': 'Luk',
  'common.delete': 'Slet',
  'common.remove': 'Fjern',
  'common.add': 'Tilføj',
  'common.done': 'Færdig',
  'common.copy': 'Kopiér',
  'common.copied': 'Kopieret!',
  'common.tryAgain': 'Prøv igen',
  'common.moreActions': 'Flere handlinger',
  'common.name': 'Navn',
  'common.brand': 'Mærke',
  'common.none': 'Ingen',
  'common.unknown': 'Ukendt',
  'common.optional': 'Valgfri',

  'error.unexpected.title': 'Noget gik galt',
  'error.unexpected.description': 'Der opstod en uventet fejl',

  'confirm.confirm': 'Bekræft',
  'confirm.typeToConfirm': 'Skriv <strong>{{name}}</strong> for at bekræfte',

  'filter.byName': 'Filtrér efter navn',
  'filter.searchByName': 'Søg efter navn...',
  'filter.allBrands': 'Alle mærker',

  'list.new': 'Ny',
  'list.adjustFilters': 'Prøv at justere din søgning eller dine filtre.',
  'list.adjustSearch': 'Prøv at justere din søgning.',

  'credential.created': 'Oprettet {{time}}',
  'credential.expires': 'Udløber {{time}}',
  'credential.expired': 'Udløb {{time}}',
  'credential.deletePasskey': 'Slet adgangsnøglen {{name}}',
  'credential.revokeApiKey': 'Tilbagekald API-nøglen {{name}}',
};
