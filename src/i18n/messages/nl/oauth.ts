import type { Translations } from '../../types';
import type { enOAuth } from '../en/oauth';

export const nlOAuth: Translations<typeof enOAuth> = {
  'oauthConsent.subtitle': 'wil toegang tot je Recipe-account',
  'oauthConsent.account': 'Account',
  'oauthConsent.clientId': 'Client-ID',
  'oauthConsent.returnsTo': 'Gaat terug naar',
  'oauthConsent.redirectWarning':
    '{{host}} is geen Claude en geen app op dit apparaat. Geef alleen toegang als je deze site vertrouwt, want hij kan dan je account gebruiken.',
  'oauthConsent.scopes': 'Gevraagde toegang',
  'oauthConsent.allow': 'Toestaan',
  'oauthConsent.deny': 'Weigeren',
  'oauthConsent.decisionError': 'Het versturen van je keuze is niet gelukt. Probeer het opnieuw.',
  'oauthConsent.missingRequest.title': 'Deze link is onvolledig',
  'oauthConsent.missingRequest.description':
    'Ga terug naar de app die je hierheen stuurde en maak opnieuw verbinding.',
  'oauthConsent.loadError.title': 'Het laden van dit verzoek is niet gelukt',
  'oauthConsent.loadError.description':
    'Het is misschien verlopen. Ga terug naar de app die je hierheen stuurde en maak opnieuw verbinding.',
};
