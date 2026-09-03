import type { Translations } from '../../types';
import type { enFood } from '../en/food';

export const svFood: Translations<typeof enFood> = {
  'product.error': 'Vi kunde inte ladda produkten. Försök igen senare.',
  'product.notFound': 'Produkten hittades inte',
  'product.preparations_one': 'Tillagning',
  'product.preparations_other': 'Tillagningar',

  'notes.title': 'Anteckningar',

  'barcodes.title': 'Streckkoder',
  'barcode.lookup': 'Slå upp',
  'barcode.lookupTitle': 'Slå upp streckkoden {{code}}',
  'barcode.use': 'Använd',
  'barcode.useTitle': 'Ange portionen till {{size}}',

  'customSizes.title': 'Egna storlekar',
  'customSizes.useTitle': 'Ange portionen till 1 {{name}}',

  'group.error': 'Vi kunde inte ladda gruppen. Försök igen senare.',
  'group.notFound': 'Gruppen hittades inte',
  'group.nutritionEstimate': 'Uppskattat näringsvärde',
  'group.items_one': 'Objekt',
  'group.items_other': 'Objekt',
  'group.empty': 'Inga objekt i den här gruppen',
  'groupItem.product': 'Produkt',
  'groupItem.group': 'Grupp',
  'groupItem.view': 'Visa {{name}}',

  'lookup.title': 'Uppslag',
  'lookup.error': 'Vi kunde inte slå upp streckkoden. Försök igen senare.',
  'lookup.prompt': 'Ange en streckkod i sökrutan ovan',
  'lookup.resultsFor': 'Resultat för:',
  'lookup.empty.title': 'Inga resultat',
  'lookup.empty.description':
    'Inga produkter eller grupper matchar streckkoden. Kontrollera numret och försök igen.',

  'category.title': 'Kategorier',
  'category.breadcrumbLabel': 'Kategori',
  'category.error': 'Vi kunde inte ladda kategorin. Försök igen senare.',
  'category.notFound': 'Kategorin hittades inte',
  'category.empty.title': 'Inga kategorier',
  'category.noSubcategories': 'Inga underkategorier',
  'category.subcategories': 'Underkategorier',
  'category.items': 'Objekt',
  'category.filterPlaceholder': 'Filtrera objekt...',
  'category.filterLabel': 'Filtrera objekt',
  'category.includeDescendants': 'Inkludera underkategorier',
  'category.noItems.title': 'Inga objekt',
  'category.noItems.description': 'Inget har lagts till i den här kategorin.',
  'category.noItems.withDescendants':
    'Inget har lagts till i den här kategorin eller dess underkategorier.',
};
