import type { Translations } from '../../types';
import type { enCommon } from '../en/common';

export const svCommon: Translations<typeof enCommon> = {
  'common.loading': 'Laddar',
  'common.loadingEllipsis': 'Laddar...',
  'common.save': 'Spara',
  'common.cancel': 'Avbryt',
  'common.close': 'Stäng',
  'common.delete': 'Ta bort',
  'common.remove': 'Ta bort',
  'common.add': 'Lägg till',
  'common.done': 'Klar',
  'common.copy': 'Kopiera',
  'common.copied': 'Kopierat!',
  'common.tryAgain': 'Försök igen',
  'common.moreActions': 'Fler åtgärder',
  'common.name': 'Namn',
  'common.brand': 'Märke',
  'common.none': 'Inga',
  'common.unknown': 'Okänt',
  'common.optional': 'Valfritt',

  'error.unexpected.title': 'Något gick fel',
  'error.unexpected.description': 'Ett oväntat fel inträffade',

  'confirm.confirm': 'Bekräfta',
  'confirm.typeToConfirm': 'Skriv <strong>{{name}}</strong> för att bekräfta',

  'filter.byName': 'Filtrera på namn',
  'filter.searchByName': 'Sök på namn...',
  'filter.allBrands': 'Alla märken',

  'list.new': 'Ny',
  'list.adjustFilters': 'Prova att justera sökningen eller filtren.',
  'list.adjustSearch': 'Prova att justera sökningen.',

  'credential.created': 'Skapad {{time}}',
  'credential.expires': 'Går ut {{time}}',
  'credential.expired': 'Gick ut {{time}}',
  'credential.deletePasskey': 'Ta bort nyckeln {{name}}',
  'credential.revokeApiKey': 'Återkalla API-nyckeln {{name}}',
};
