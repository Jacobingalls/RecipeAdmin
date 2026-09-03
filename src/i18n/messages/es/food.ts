import type { Translations } from '../../types';
import type { enFood } from '../en/food';

export const esFood: Translations<typeof enFood> = {
  'product.error': 'No pudimos cargar este producto. Inténtalo más tarde.',
  'product.notFound': 'Producto no encontrado',
  'product.preparations_one': 'Preparación',
  'product.preparations_other': 'Preparaciones',

  'notes.title': 'Notas',

  'barcodes.title': 'Códigos de barras',
  'barcode.lookup': 'Buscar',
  'barcode.lookupTitle': 'Buscar el código de barras {{code}}',
  'barcode.use': 'Usar',
  'barcode.useTitle': 'Fijar la ración en {{size}}',

  'customSizes.title': 'Tamaños personalizados',
  'customSizes.useTitle': 'Fijar la ración en 1 {{name}}',

  'group.error': 'No pudimos cargar este grupo. Inténtalo más tarde.',
  'group.notFound': 'Grupo no encontrado',
  'group.nutritionEstimate': 'Nutrición estimada',
  'group.items_one': 'Elemento',
  'group.items_other': 'Elementos',
  'group.empty': 'No hay elementos en este grupo',
  'groupItem.product': 'Producto',
  'groupItem.group': 'Grupo',
  'groupItem.view': 'Ver {{name}}',

  'lookup.title': 'Búsqueda',
  'lookup.error': 'No pudimos buscar este código de barras. Inténtalo más tarde.',
  'lookup.prompt': 'Escribe un código de barras en el cuadro de búsqueda de arriba',
  'lookup.resultsFor': 'Resultados de:',
  'lookup.empty.title': 'Sin resultados',
  'lookup.empty.description':
    'Ningún producto ni grupo coincide con este código de barras. Comprueba el número e inténtalo de nuevo.',

  'category.title': 'Categorías',
  'category.breadcrumbLabel': 'Categoría',
  'category.error': 'No pudimos cargar esta categoría. Inténtalo más tarde.',
  'category.notFound': 'Categoría no encontrada',
  'category.empty.title': 'Sin categorías',
  'category.noSubcategories': 'Sin subcategorías',
  'category.subcategories': 'Subcategorías',
  'category.items': 'Elementos',
  'category.filterPlaceholder': 'Filtrar elementos...',
  'category.filterLabel': 'Filtrar elementos',
  'category.includeDescendants': 'Incluir subcategorías',
  'category.noItems.title': 'Sin elementos',
  'category.noItems.description': 'No se ha añadido nada a esta categoría.',
  'category.noItems.withDescendants':
    'No se ha añadido nada a esta categoría ni a sus subcategorías.',
};
