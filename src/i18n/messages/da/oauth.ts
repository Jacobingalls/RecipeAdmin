import type { Translations } from '../../types';
import type { enOAuth } from '../en/oauth';

export const daOAuth: Translations<typeof enOAuth> = {
  'oauthConsent.subtitle': 'vil have adgang til din Recipe-konto',
  'oauthConsent.account': 'Konto',
  'oauthConsent.clientId': 'Klient-id',
  'oauthConsent.returnsTo': 'Vender tilbage til',
  'oauthConsent.redirectWarning':
    '{{host}} er hverken Claude eller en app på denne enhed. Giv kun adgang, hvis du stoler på siden, for den vil kunne bruge din konto.',
  'oauthConsent.scopes': 'Ønsket adgang',
  'oauthConsent.allow': 'Tillad',
  'oauthConsent.deny': 'Afvis',
  'oauthConsent.decisionError': 'Vi kunne ikke sende dit svar. Prøv igen.',
  'oauthConsent.missingRequest.title': 'Linket er ufuldstændigt',
  'oauthConsent.missingRequest.description':
    'Gå tilbage til den app, der sendte dig hertil, og opret forbindelse igen.',
  'oauthConsent.loadError.title': 'Vi kunne ikke indlæse anmodningen',
  'oauthConsent.loadError.description':
    'Den er måske udløbet. Gå tilbage til den app, der sendte dig hertil, og opret forbindelse igen.',
};
