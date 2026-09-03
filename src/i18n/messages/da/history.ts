import type { Translations } from '../../types';
import type { enHistory } from '../en/history';

export const daHistory: Translations<typeof enHistory> = {
  'history.title': 'Historik',
  'history.today': 'I dag',
  'history.yesterday': 'I går',
  'history.dayLabel': '{{heading}} ({{date}})',
  'history.error': 'Vi kunne ikke indlæse historikken. Prøv igen senere.',
  'history.empty.title': 'Ingen historik',
  'history.empty.description': 'Log noget for at se det her.',
  'history.loadingMore': 'Indlæser flere poster',
  'history.endOfList': 'Du er helt med.',
  'history.caloriesTotal': '{{calories}} kcal i alt,',
  'history.viewFullNutrition': 'Vis hele næringsindholdet',

  'dayNutrition.title': 'Dagens næringsindhold',
  'dayNutrition.prepName': 'Dagens total ({{day}})',
  'dayNutrition.servingDescription': 'Samlet næringsindhold indtaget {{day}}',

  'entry.view': 'Vis {{name}}',
  'entry.log': 'Log {{name}}',
  'entry.addToLog': 'Føj til loggen',
  'entry.actions': 'Handlinger for posten',
  'entry.edit': 'Rediger',
  'entry.remove': 'Fjern',

  'favorite.add': 'Føj til favoritter',
  'favorite.remove': 'Fjern fra favoritter',
  'favorite.actions': 'Handlinger for {{name}}',

  'log.when': 'Hvornår',
  'log.button.save': 'Gem',
  'log.button.saving': 'Gemmer...',
  'log.button.saved': 'Gemt!',
  'log.button.add': 'Føj til loggen',
  'log.button.logging': 'Logger...',
  'log.button.logged': 'Logget!',

  'search.resultsLabel': 'Søgeresultater',
  'search.error': 'Vi kunne ikke indlæse søgeresultaterne. Prøv igen.',
  'search.empty.title': 'Ingen resultater',
  'search.start.title': 'Søg efter produkter og grupper',
  'search.start.description': 'Brug søgefeltet ovenfor for at komme i gang.',
};
