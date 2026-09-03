import type { Translations } from '../../types';
import type { enHome } from '../en/home';

export const svHome: Translations<typeof enHome> = {
  'home.greeting.morning': 'God morgon',
  'home.greeting.afternoon': 'God eftermiddag',
  'home.greeting.evening': 'God kväll',
  'home.greeting.fallbackName': 'du',

  'home.today.title': 'I dag',
  'home.today.historyLink': 'Historik',
  'home.today.error.title': 'Vi kunde inte ladda dagens näringsvärden',
  'home.today.empty.title': 'Inget loggat i dag',
  'home.today.empty.description': 'Logga något för att se dina näringsvärden här.',

  'home.favorites.viewAll': 'Visa alla',

  'nutrientShort.calories': 'Kalorier',
  'nutrientShort.protein': 'Protein',
  'nutrientShort.fat': 'Fett',
  'nutrientShort.carbs': 'Kolhydrater',
  'nutrientShort.fiber': 'Fiber',
  'nutrientShort.sugar': 'Socker',
  'nutrientShort.sodium': 'Natrium',

  'sparkline.onTarget': 'på målet',
  'sparkline.nearTarget': 'nära målet',
  'sparkline.offTarget': 'utanför målet',
  'sparkline.percentOfDaily': '{{percent}} % av {{amount}} {{unit}}',

  'favorites.title': 'Favoriter',
  'favorites.loadError': 'Vi kunde inte ladda favoriterna. Försök igen senare.',
  'favorites.error.title': 'Vi kunde inte ladda favoriterna',
  'favorites.error.description': 'Försök igen senare.',
  'favorites.empty.title': 'Inga favoriter',
  'favorites.empty.description': 'Lägg till favoriter från produkt- eller gruppsidor.',
};
