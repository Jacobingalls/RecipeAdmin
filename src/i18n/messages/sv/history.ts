import type { Translations } from '../../types';
import type { enHistory } from '../en/history';

export const svHistory: Translations<typeof enHistory> = {
  'history.title': 'Historik',
  'history.today': 'I dag',
  'history.yesterday': 'I går',
  'history.dayLabel': '{{heading}} ({{date}})',
  'history.error': 'Vi kunde inte ladda historiken. Försök igen senare.',
  'history.empty.title': 'Ingen historik',
  'history.empty.description': 'Logga något för att se det här.',
  'history.loadingMore': 'Laddar fler poster',
  'history.endOfList': 'Du har sett allt.',
  'history.energyTotal': '{{amount}} totalt,',
  'history.viewFullNutrition': 'Visa alla näringsvärden',

  'dayNutrition.title': 'Dagens näringsvärden',
  'dayNutrition.prepName': 'Totalt för dagen ({{day}})',
  'dayNutrition.servingDescription': 'Totala näringsvärden för {{day}}',

  'entry.view': 'Visa {{name}}',
  'entry.log': 'Logga {{name}}',
  'entry.addToLog': 'Lägg till i loggen',
  'entry.actions': 'Åtgärder för posten',
  'entry.edit': 'Redigera',
  'entry.remove': 'Ta bort',

  'favorite.add': 'Lägg till i favoriter',
  'favorite.remove': 'Ta bort från favoriter',
  'favorite.actions': 'Åtgärder för {{name}}',

  'log.when': 'När',
  'log.button.save': 'Spara',
  'log.button.saving': 'Sparar...',
  'log.button.saved': 'Sparat!',
  'log.button.add': 'Lägg till i loggen',
  'log.button.logging': 'Loggar...',
  'log.button.logged': 'Loggat!',

  'search.resultsLabel': 'Sökresultat',
  'search.error': 'Vi kunde inte ladda sökresultaten. Försök igen.',
  'search.empty.title': 'Inga resultat',
  'search.start.title': 'Sök bland produkter och grupper',
  'search.start.description': 'Använd sökrutan ovan för att komma igång.',
};
