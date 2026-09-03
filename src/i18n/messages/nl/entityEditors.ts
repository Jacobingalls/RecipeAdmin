import type { enEntityEditors } from '../en/entityEditors';

export const nlEntityEditors: Record<keyof typeof enEntityEditors, string> = {
  'productEditor.error': 'We konden dit product niet laden. Probeer het later opnieuw.',
  'productEditor.notFound': 'Product niet gevonden',
  'productEditor.preparations': 'Bereidingen',
  'productEditor.noPreparations': 'Geen bereidingen',
  'productEditor.defaultPreparation': 'Standaardbereiding',
  'productEditor.defaultPreparationOption': 'Standaard ({{name}})',
  'productEditor.preparation': 'Bereiding',
  'productEditor.newPreparation': 'Nieuwe bereiding',
  'productEditor.preparationNamePlaceholder': 'bijv. Gekookt',
  'productEditor.nutrition': 'Voedingswaarde (per portie)',
  'productEditor.noNutrition': 'Geen voedingsgegevens',
  'productEditor.servingDescription': 'Omschrijving van de portie',
  'productEditor.servingDescriptionPlaceholder': 'bijv. 1 el (14 g)',
  'productEditor.actions': 'Productacties',
  'productEditor.delete.title': 'Dit product verwijderen',
  'productEditor.delete.description':
    'Hiermee verwijder je dit product en alle bijbehorende gegevens definitief. Dit kun je niet ongedaan maken.',
  'productEditor.delete.action': 'Product verwijderen',
  'productEditor.delete.modalTitle': 'Product verwijderen',
  'productEditor.delete.message':
    'Hiermee verwijder je <strong>{{name}}</strong> en alle bijbehorende gegevens definitief. Dit kun je niet ongedaan maken.',
  'productEditor.delete.confirm': 'Dit product verwijderen',
  'productEditor.delete.error': 'Dit product verwijderen is niet gelukt. Probeer het opnieuw.',

  'prepEditor.actions': 'Bereidingsacties',
  'prepEditor.delete.title': 'Deze bereiding verwijderen',
  'prepEditor.delete.onlyPrep':
    'Je kunt de enige bereiding niet verwijderen. Voeg er eerst een toe.',
  'prepEditor.delete.description':
    'Hiermee verwijder je deze bereiding en de voedingsgegevens definitief.',
  'prepEditor.delete.modalTitle': 'Bereiding verwijderen',
  'prepEditor.delete.message':
    'Hiermee verwijder je <strong>{{name}}</strong> en de voedingsgegevens definitief. Dit kun je niet ongedaan maken.',
  'prepEditor.delete.confirm': 'Bereiding verwijderen',

  'groupEditor.error': 'We konden deze groep niet laden. Probeer het later opnieuw.',
  'groupEditor.resolveError': 'We konden de items van deze groep niet ophalen.',
  'groupEditor.notFound': 'Groep niet gevonden',
  'groupEditor.items': 'Items',
  'groupEditor.noItems': 'Geen items',
  'groupEditor.addItem': 'Item toevoegen',
  'groupEditor.editItem': 'Item bewerken',
  'groupEditor.searchPlaceholder': 'Zoek producten en groepen...',
  'groupEditor.searching': 'Zoeken...',
  'groupEditor.noResults': 'Geen resultaten',
  'groupEditor.clearSelection': 'Selectie wissen',
  'groupEditor.itemServingAmount': 'Hoeveelheid voor itemportie',
  'groupEditor.itemServingUnit': 'Eenheid voor itemportie',
  'groupEditor.oneServing': '1 portie',
  'groupEditor.calories': '{{amount}} cal',
  'groupEditor.thisGroup': 'deze groep',
  'groupEditor.actions': 'Groepsacties',
  'groupEditor.delete.title': 'Deze groep verwijderen',
  'groupEditor.delete.description':
    'Hiermee verwijder je deze groep en alle bijbehorende gegevens definitief. Dit kun je niet ongedaan maken.',
  'groupEditor.delete.action': 'Groep verwijderen',
  'groupEditor.delete.modalTitle': 'Groep verwijderen',
  'groupEditor.delete.message':
    'Hiermee verwijder je <strong>{{name}}</strong> en alle bijbehorende gegevens definitief. Dit kun je niet ongedaan maken.',
  'groupEditor.delete.confirm': 'Deze groep verwijderen',
  'groupEditor.delete.error': 'Deze groep verwijderen is niet gelukt. Probeer het opnieuw.',

  'categoryEditor.error': 'We konden deze categorie niet laden. Probeer het later opnieuw.',
  'categoryEditor.notFound': 'Categorie niet gevonden',
  'categoryEditor.displayName': 'Weergavenaam',
  'categoryEditor.slug': 'Slug',
  'categoryEditor.description': 'Omschrijving',
  'categoryEditor.slugInvalid': 'Alleen kleine letters, cijfers en koppeltekens.',
  'categoryEditor.slugInvalidHint':
    'Een slug mag alleen kleine letters, cijfers en koppeltekens bevatten (bijv. "vers-fruit").',
  'categoryEditor.saveError': 'Deze categorie opslaan is niet gelukt. Probeer het opnieuw.',
  'categoryEditor.parents': 'Bovenliggend',
  'categoryEditor.children': 'Onderliggend',
  'categoryEditor.noParents': 'Geen bovenliggende categorieën',
  'categoryEditor.noChildren': 'Geen onderliggende categorieën',
  'categoryEditor.removing': 'Verwijderen',
  'categoryEditor.removeRelationError':
    'Deze koppeling verwijderen is niet gelukt. Probeer het opnieuw.',
  'categoryEditor.addParent': 'Bovenliggende categorie toevoegen',
  'categoryEditor.addChild': 'Onderliggende categorie toevoegen',
  'categoryEditor.addError': 'Deze categorie toevoegen is niet gelukt. Probeer het opnieuw.',
  'categoryEditor.newCategory': 'Nieuwe categorie',
  'categoryEditor.createParent': 'Nieuwe bovenliggende categorie',
  'categoryEditor.createChild': 'Nieuwe onderliggende categorie',
  'categoryEditor.createError': 'Deze categorie aanmaken is niet gelukt. Probeer het opnieuw.',
  'categoryEditor.actions': 'Categorieacties',
  'categoryEditor.delete.title': 'Deze categorie verwijderen',
  'categoryEditor.delete.description':
    'Hiermee verwijder je deze categorie definitief. Dit kun je niet ongedaan maken.',
  'categoryEditor.delete.hasChildren':
    'Verwijder eerst alle onderliggende categorieën voordat je deze categorie verwijdert.',
  'categoryEditor.delete.hasItems':
    'Aan deze categorie zijn producten gekoppeld. Verwijder die eerst.',
  'categoryEditor.delete.action': 'Categorie verwijderen',
  'categoryEditor.delete.modalTitle': 'Categorie verwijderen',
  'categoryEditor.delete.message':
    'Hiermee verwijder je <strong>{{name}}</strong> definitief. Dit kun je niet ongedaan maken.',
  'categoryEditor.delete.confirm': 'Deze categorie verwijderen',
  'categoryEditor.delete.error': 'Deze categorie verwijderen is niet gelukt. Probeer het opnieuw.',
};
