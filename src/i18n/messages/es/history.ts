import type { Translations } from '../../types';
import type { enHistory } from '../en/history';

export const esHistory: Translations<typeof enHistory> = {
  'history.title': 'Historial',
  'history.today': 'Hoy',
  'history.yesterday': 'Ayer',
  'history.dayLabel': '{{heading}} ({{date}})',
  'history.error': 'No pudimos cargar el historial. Inténtalo más tarde.',
  'history.empty.title': 'Sin historial',
  'history.empty.description': 'Registra algo para verlo aquí.',
  'history.loadingMore': 'Cargando más entradas',
  'history.endOfList': 'Ya lo has visto todo.',
  'history.caloriesTotal': '{{calories}} kcal en total,',
  'history.viewFullNutrition': 'Ver la nutrición completa',

  'dayNutrition.title': 'Nutrición diaria',
  'dayNutrition.prepName': 'Total del día ({{day}})',
  'dayNutrition.servingDescription': 'Nutrición total consumida el {{day}}',

  'entry.view': 'Ver {{name}}',
  'entry.log': 'Registrar {{name}}',
  'entry.addToLog': 'Añadir al registro',
  'entry.actions': 'Acciones de la entrada',
  'entry.edit': 'Editar',
  'entry.remove': 'Quitar',

  'favorite.add': 'Añadir a favoritos',
  'favorite.remove': 'Quitar de favoritos',
  'favorite.actions': 'Acciones de {{name}}',

  'log.when': 'Cuándo',
  'log.button.save': 'Guardar',
  'log.button.saving': 'Guardando...',
  'log.button.saved': '¡Guardado!',
  'log.button.add': 'Añadir al registro',
  'log.button.logging': 'Registrando...',
  'log.button.logged': '¡Registrado!',

  'search.resultsLabel': 'Resultados de la búsqueda',
  'search.error': 'No pudimos cargar los resultados. Inténtalo de nuevo.',
  'search.empty.title': 'Sin resultados',
  'search.start.title': 'Busca productos y grupos',
  'search.start.description': 'Usa el cuadro de búsqueda de arriba para empezar.',
};
