import type { Translations } from '../../types';
import type { enAuth } from '../en/auth';

export const daAuth: Translations<typeof enAuth> = {
  'login.signInWithPasskey': 'Log ind med adgangsnøgle',
  'login.signInWithApiKey': 'Log ind med API-nøgle',
  'login.usernameOrEmail': 'Brugernavn eller e-mail',
  'login.apiKey': 'API-nøgle',
  'login.submit': 'Log ind',
  'login.error.passkey': 'Vi kunne ikke logge dig ind med adgangsnøglen. Prøv igen.',
  'login.error.credentials': 'Vi kunne ikke logge dig ind. Tjek dine oplysninger, og prøv igen.',

  'passkey.registerError': 'Noget gik galt, da adgangsnøglen blev registreret. Prøv igen.',
  'passkey.registerErrorTitle': 'Noget gik galt, da adgangsnøglen blev registreret',
  'passkeyPrompt.title': 'Sikr din konto med en adgangsnøgle',
  'passkeyPrompt.description': 'Log hurtigere og sikrere ind med fingeraftryk eller ansigt.',
  'passkeyPrompt.setUp': 'Kom i gang',
  'passkeyPrompt.remindLater': 'Mind mig om det senere',

  'credentials.title': 'Loginoplysninger',
  'credentials.passkey': 'Adgangsnøgle',
  'credentials.apiKey': 'API-nøgle',
  'credentials.empty': 'Ingen loginoplysninger',
  'credentials.dismiss': 'Luk',
  'credentials.deletePasskeyTitle': 'Slet adgangsnøgle',
  'credentials.revokeApiKeyTitle': 'Tilbagekald API-nøgle',
  'credentials.deleteMessage':
    'Dette sletter <strong>{{name}}</strong> permanent. Handlingen kan ikke fortrydes.',
  'credentials.revokeMessage':
    'Dette tilbagekalder <strong>{{name}}</strong> permanent. Handlingen kan ikke fortrydes.',
  'credentials.revokeKeyConfirm': 'Tilbagekald nøglen',

  'apiKey.create.title': 'Opret API-nøgle',
  'apiKey.create.warning':
    'Gem nøglen et sikkert sted. Den fungerer som din adgangskode og kan ikke hentes igen, når du lukker dialogen.',
  'apiKey.create.keyLabel': 'API-nøgle',
  'apiKey.create.expires': 'Udløber {{time}}',
  'apiKey.create.nameLabel': 'Navn på nøglen',
  'apiKey.create.setExpiration': 'Angiv udløb',
  'apiKey.create.expiresAt': 'Udløber',
  'apiKey.create.error': 'Vi kunne ikke oprette API-nøglen. Prøv igen.',
  'apiKey.create.submit': 'Opret',

  'sessions.title': 'Sessioner',
  'sessions.signOut': 'Log ud',
  'sessions.moreOptions': 'Flere muligheder for at logge ud',
  'sessions.signOutEverywhere': 'Log ud alle steder',
  'sessions.created': 'Oprettet {{time}}',
  'sessions.lastActive': 'Senest aktiv {{time}}',
  'sessions.expires': 'Udløber {{time}}',
  'sessions.revoke': 'Tilbagekald sessionen {{name}}',
  'sessions.empty': 'Ingen aktive sessioner',
  'sessions.revokeAll.title': 'Tilbagekald alle sessioner',
  'sessions.revokeAll.message': 'Dette logger dig ud på alle enheder, inklusive denne.',
  'sessions.revokeAll.confirm': 'Tilbagekald sessioner',
};
