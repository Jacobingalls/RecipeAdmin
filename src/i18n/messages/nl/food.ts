import type { Translations } from '../../types';
import type { enFood } from '../en/food';

export const nlFood: Translations<typeof enFood> = {
  'product.error': 'We konden dit product niet laden. Probeer het later opnieuw.',
  'product.notFound': 'Product niet gevonden',
  'product.preparations_one': 'Bereiding',
  'product.preparations_other': 'Bereidingen',

  'notes.title': 'Notities',

  'barcodes.title': 'Barcodes',
  'barcode.lookup': 'Opzoeken',
  'barcode.lookupTitle': 'Barcode {{code}} opzoeken',
  'barcode.use': 'Gebruiken',
  'barcode.useTitle': 'Portie instellen op {{size}}',

  'customSizes.title': 'Eigen porties',
  'customSizes.useTitle': 'Portie instellen op 1 {{name}}',

  'group.error': 'We konden deze groep niet laden. Probeer het later opnieuw.',
  'group.notFound': 'Groep niet gevonden',
  'group.nutritionEstimate': 'Geschatte voedingswaarde',
  'group.items_one': 'Item',
  'group.items_other': 'Items',
  'group.empty': 'Geen items in deze groep',
  'groupItem.product': 'Product',
  'groupItem.group': 'Groep',
  'groupItem.view': '{{name}} bekijken',

  'lookup.title': 'Opzoeken',
  'lookup.error': 'We konden deze barcode niet opzoeken. Probeer het later opnieuw.',
  'lookup.prompt': 'Voer hierboven een barcode in het zoekvak in',
  'lookup.resultsFor': 'Resultaten voor:',
  'lookup.empty.title': 'Geen resultaten',
  'lookup.empty.description':
    'Geen producten of groepen met deze barcode. Controleer het nummer en probeer het opnieuw.',

  'category.title': 'Categorieën',
  'category.breadcrumbLabel': 'Categorie',
  'category.error': 'We konden deze categorie niet laden. Probeer het later opnieuw.',
  'category.notFound': 'Categorie niet gevonden',
  'category.empty.title': 'Geen categorieën',
  'category.noSubcategories': 'Geen subcategorieën',
  'category.subcategories': 'Subcategorieën',
  'category.items': 'Items',
  'category.filterPlaceholder': 'Filter items...',
  'category.filterLabel': 'Items filteren',
  'category.includeDescendants': 'Subcategorieën meenemen',
  'category.noItems.title': 'Geen items',
  'category.noItems.description': 'Er is niets toegevoegd aan deze categorie.',
  'category.noItems.withDescendants':
    'Er is niets toegevoegd aan deze categorie of de subcategorieën.',
};
