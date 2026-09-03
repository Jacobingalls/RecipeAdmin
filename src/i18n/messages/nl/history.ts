import type { enHistory } from '../en/history';

export const nlHistory: Record<keyof typeof enHistory, string> = {
  'history.title': 'Geschiedenis',
  'history.today': 'Vandaag',
  'history.yesterday': 'Gisteren',
  'history.dayLabel': '{{heading}} ({{date}})',
  'history.error': 'We konden je geschiedenis niet laden. Probeer het later opnieuw.',
  'history.empty.title': 'Geen geschiedenis',
  'history.empty.description': 'Log iets om het hier terug te zien.',
  'history.loadingMore': 'Meer items laden',
  'history.endOfList': 'Je bent helemaal bij.',
  'history.caloriesTotal': '{{calories}} kcal totaal,',
  'history.viewFullNutrition': 'Volledige voedingswaarde bekijken',

  'dayNutrition.title': 'Dagelijkse voeding',
  'dayNutrition.prepName': 'Dagtotaal ({{day}})',
  'dayNutrition.servingDescription': 'Totale voeding op {{day}}',

  'entry.view': '{{name}} bekijken',
  'entry.log': '{{name}} loggen',
  'entry.addToLog': 'Toevoegen aan logboek',
  'entry.actions': 'Acties voor dit item',
  'entry.edit': 'Bewerken',
  'entry.remove': 'Verwijderen',

  'favorite.add': 'Toevoegen aan favorieten',
  'favorite.remove': 'Verwijderen uit favorieten',
  'favorite.actions': 'Acties voor {{name}}',

  'log.when': 'Wanneer',
  'log.button.save': 'Opslaan',
  'log.button.saving': 'Opslaan...',
  'log.button.saved': 'Opgeslagen!',
  'log.button.add': 'Toevoegen aan logboek',
  'log.button.logging': 'Loggen...',
  'log.button.logged': 'Gelogd!',

  'search.resultsLabel': 'Zoekresultaten',
  'search.error': 'We konden de zoekresultaten niet laden. Probeer het opnieuw.',
  'search.empty.title': 'Geen resultaten',
  'search.start.title': 'Zoek producten en groepen',
  'search.start.description': 'Gebruik het zoekvak hierboven om te beginnen.',
};
