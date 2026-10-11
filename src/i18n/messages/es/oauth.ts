import type { Translations } from '../../types';
import type { enOAuth } from '../en/oauth';

export const esOAuth: Translations<typeof enOAuth> = {
  'oauthConsent.subtitle': 'quiere acceder a tu cuenta de Recipe',
  'oauthConsent.account': 'Cuenta',
  'oauthConsent.clientId': 'ID de cliente',
  'oauthConsent.returnsTo': 'Vuelve a',
  'oauthConsent.redirectWarning':
    '{{host}} no es Claude ni una app de este dispositivo. Permite el acceso solo si confías en este sitio, porque podrá usar tu cuenta.',
  'oauthConsent.scopes': 'Acceso solicitado',
  'oauthConsent.allow': 'Permitir',
  'oauthConsent.deny': 'Denegar',
  'oauthConsent.decisionError': 'No pudimos enviar tu decisión. Inténtalo de nuevo.',
  'oauthConsent.missingRequest.title': 'Este enlace está incompleto',
  'oauthConsent.missingRequest.description':
    'Vuelve a la app que te trajo aquí y conéctate de nuevo.',
  'oauthConsent.loadError.title': 'No pudimos cargar esta solicitud',
  'oauthConsent.loadError.description':
    'Puede que haya caducado. Vuelve a la app que te trajo aquí y conéctate de nuevo.',
};
