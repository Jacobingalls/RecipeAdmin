import type { Translations } from '../../types';
import type { enHome } from '../en/home';

export const daHome: Translations<typeof enHome> = {
  'home.greeting.morning': 'Godmorgen',
  'home.greeting.afternoon': 'God eftermiddag',
  'home.greeting.evening': 'Godaften',
  'home.greeting.fallbackName': 'du',

  'home.today.title': 'I dag',
  'home.today.historyLink': 'Historik',
  'home.today.error.title': 'Vi kunne ikke indlæse dagens næringsindhold',
  'home.today.empty.title': 'Intet logget i dag',
  'home.today.empty.description': 'Log noget for at se dit daglige næringsindhold her.',

  'home.favorites.viewAll': 'Vis alle',

  'nutrientShort.calories': 'Kalorier',
  'nutrientShort.energy': 'Energi',
  'nutrientShort.protein': 'Protein',
  'nutrientShort.fat': 'Fedt',
  'nutrientShort.carbs': 'Kulhydrater',
  'nutrientShort.fiber': 'Fibre',
  'nutrientShort.sugar': 'Sukker',
  'nutrientShort.sodium': 'Natrium',

  'sparkline.onTarget': 'på målet',
  'sparkline.nearTarget': 'tæt på målet',
  'sparkline.offTarget': 'uden for målet',
  'sparkline.percentOfDaily': '{{percent}} % af {{amount}} {{unit}}',

  'favorites.title': 'Favoritter',
  'favorites.loadError': 'Vi kunne ikke indlæse favoritterne. Prøv igen senere.',
  'favorites.error.title': 'Vi kunne ikke indlæse favoritterne',
  'favorites.error.description': 'Prøv igen senere.',
  'favorites.empty.title': 'Ingen favoritter',
  'favorites.empty.description': 'Tilføj favoritter fra produkt- eller gruppesider.',
};
