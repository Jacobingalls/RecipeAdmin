import type { Translations } from '../../types';
import type { enHome } from '../en/home';

export const esHome: Translations<typeof enHome> = {
  'home.greeting.morning': 'Buenos días',
  'home.greeting.afternoon': 'Buenas tardes',
  'home.greeting.evening': 'Buenas noches',
  'home.greeting.fallbackName': '¿qué tal?',

  'home.today.title': 'Hoy',
  'home.today.historyLink': 'Historial',
  'home.today.error.title': 'No pudimos cargar la nutrición de hoy',
  'home.today.empty.title': 'Nada registrado hoy',
  'home.today.empty.description': 'Registra algo para ver aquí tu nutrición diaria.',

  'home.favorites.viewAll': 'Ver todo',

  'nutrientShort.calories': 'Calorías',
  'nutrientShort.energy': 'Energía',
  'nutrientShort.protein': 'Proteínas',
  'nutrientShort.fat': 'Grasas',
  'nutrientShort.carbs': 'Carbohidratos',
  'nutrientShort.fiber': 'Fibra',
  'nutrientShort.sugar': 'Azúcares',
  'nutrientShort.sodium': 'Sodio',

  'sparkline.onTarget': 'en el objetivo',
  'sparkline.nearTarget': 'cerca del objetivo',
  'sparkline.offTarget': 'lejos del objetivo',
  'sparkline.percentOfDaily': '{{percent}} % de {{amount}} {{unit}}',

  'favorites.title': 'Favoritos',
  'favorites.loadError': 'No pudimos cargar los favoritos. Inténtalo más tarde.',
  'favorites.error.title': 'No pudimos cargar los favoritos',
  'favorites.error.description': 'Inténtalo más tarde.',
  'favorites.empty.title': 'Sin favoritos',
  'favorites.empty.description': 'Añade favoritos desde las páginas de productos o grupos.',
};
