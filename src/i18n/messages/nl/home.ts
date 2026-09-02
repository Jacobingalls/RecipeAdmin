import type { enHome } from '../en/home';

export const nlHome: Record<keyof typeof enHome, string> = {
  'home.greeting.morning': 'Goedemorgen',
  'home.greeting.afternoon': 'Goedemiddag',
  'home.greeting.evening': 'Goedenavond',
  'home.greeting.fallbackName': 'daar',

  'home.today.title': 'Vandaag',
  'home.today.historyLink': 'Geschiedenis',
  'home.today.error.title': 'We konden de voeding van vandaag niet laden',
  'home.today.empty.title': 'Nog niets gelogd vandaag',
  'home.today.empty.description': 'Log iets om je dagelijkse voeding hier te zien.',

  'home.favorites.viewAll': 'Alles bekijken',

  'nutrientShort.calories': 'Calorieën',
  'nutrientShort.protein': 'Eiwit',
  'nutrientShort.fat': 'Vet',
  'nutrientShort.carbs': 'Koolhydraten',
  'nutrientShort.fiber': 'Vezels',
  'nutrientShort.sugar': 'Suiker',
  'nutrientShort.sodium': 'Natrium',

  'sparkline.onTarget': 'op schema',
  'sparkline.nearTarget': 'bijna op schema',
  'sparkline.offTarget': 'niet op schema',
  'sparkline.percentOfDaily': '{percent}% van {amount} {unit}',

  'favorites.title': 'Favorieten',
  'favorites.loadError': 'We konden je favorieten niet laden. Probeer het later opnieuw.',
  'favorites.error.title': 'We konden je favorieten niet laden',
  'favorites.error.description': 'Probeer het later opnieuw.',
  'favorites.empty.title': 'Geen favorieten',
  'favorites.empty.description': "Voeg favorieten toe vanaf product- of groepspagina's.",
};
