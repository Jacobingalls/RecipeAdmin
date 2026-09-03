import type { Translations } from '../../types';
import type { enFood } from '../en/food';

export const daFood: Translations<typeof enFood> = {
  'product.error': 'Vi kunne ikke indlæse produktet. Prøv igen senere.',
  'product.notFound': 'Produktet blev ikke fundet',
  'product.preparations_one': 'Tilberedning',
  'product.preparations_other': 'Tilberedninger',

  'notes.title': 'Noter',

  'barcodes.title': 'Stregkoder',
  'barcode.lookup': 'Slå op',
  'barcode.lookupTitle': 'Slå stregkoden {{code}} op',
  'barcode.use': 'Brug',
  'barcode.useTitle': 'Sæt portionen til {{size}}',

  'customSizes.title': 'Egne størrelser',
  'customSizes.useTitle': 'Sæt portionen til 1 {{name}}',

  'group.error': 'Vi kunne ikke indlæse gruppen. Prøv igen senere.',
  'group.notFound': 'Gruppen blev ikke fundet',
  'group.nutritionEstimate': 'Anslået næringsindhold',
  'group.items_one': 'Element',
  'group.items_other': 'Elementer',
  'group.empty': 'Ingen elementer i denne gruppe',
  'groupItem.product': 'Produkt',
  'groupItem.group': 'Gruppe',
  'groupItem.view': 'Vis {{name}}',

  'lookup.title': 'Opslag',
  'lookup.error': 'Vi kunne ikke slå stregkoden op. Prøv igen senere.',
  'lookup.prompt': 'Indtast en stregkode i søgefeltet ovenfor',
  'lookup.resultsFor': 'Resultater for:',
  'lookup.empty.title': 'Ingen resultater',
  'lookup.empty.description':
    'Ingen produkter eller grupper matcher denne stregkode. Tjek nummeret, og prøv igen.',

  'category.title': 'Kategorier',
  'category.breadcrumbLabel': 'Kategori',
  'category.error': 'Vi kunne ikke indlæse kategorien. Prøv igen senere.',
  'category.notFound': 'Kategorien blev ikke fundet',
  'category.empty.title': 'Ingen kategorier',
  'category.noSubcategories': 'Ingen underkategorier',
  'category.subcategories': 'Underkategorier',
  'category.items': 'Elementer',
  'category.filterPlaceholder': 'Filtrér elementer...',
  'category.filterLabel': 'Filtrér elementer',
  'category.includeDescendants': 'Inkludér underkategorier',
  'category.noItems.title': 'Ingen elementer',
  'category.noItems.description': 'Der er ikke tilføjet noget til denne kategori.',
  'category.noItems.withDescendants':
    'Der er ikke tilføjet noget til denne kategori eller dens underkategorier.',
};
