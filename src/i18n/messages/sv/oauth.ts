import type { Translations } from '../../types';
import type { enOAuth } from '../en/oauth';

export const svOAuth: Translations<typeof enOAuth> = {
  'oauthConsent.subtitle': 'vill komma åt ditt Recipe-konto',
  'oauthConsent.account': 'Konto',
  'oauthConsent.clientId': 'Klient-id',
  'oauthConsent.returnsTo': 'Återvänder till',
  'oauthConsent.redirectWarning':
    '{{host}} är varken Claude eller en app på den här enheten. Ge bara åtkomst om du litar på webbplatsen, eftersom den då kan använda ditt konto.',
  'oauthConsent.scopes': 'Begärd åtkomst',
  'oauthConsent.allow': 'Tillåt',
  'oauthConsent.deny': 'Neka',
  'oauthConsent.decisionError': 'Vi kunde inte skicka ditt beslut. Försök igen.',
  'oauthConsent.missingRequest.title': 'Länken är ofullständig',
  'oauthConsent.missingRequest.description':
    'Gå tillbaka till appen som skickade dig hit och anslut igen.',
  'oauthConsent.loadError.title': 'Vi kunde inte läsa in begäran',
  'oauthConsent.loadError.description':
    'Den kan ha gått ut. Gå tillbaka till appen som skickade dig hit och anslut igen.',
};
