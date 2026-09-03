import type { Translations } from '../../types';
import type { enAuth } from '../en/auth';

export const svAuth: Translations<typeof enAuth> = {
  'login.signInWithPasskey': 'Logga in med nyckel',
  'login.signInWithApiKey': 'Logga in med API-nyckel',
  'login.usernameOrEmail': 'Användarnamn eller e-post',
  'login.apiKey': 'API-nyckel',
  'login.submit': 'Logga in',
  'login.error.passkey': 'Vi kunde inte logga in dig med nyckeln. Försök igen.',
  'login.error.credentials': 'Vi kunde inte logga in dig. Kontrollera uppgifterna och försök igen.',

  'passkey.registerError': 'Något gick fel när nyckeln registrerades. Försök igen.',
  'passkey.registerErrorTitle': 'Något gick fel när nyckeln registrerades',
  'passkeyPrompt.title': 'Skydda kontot med en nyckel',
  'passkeyPrompt.description': 'Logga in snabbare och säkrare med fingeravtryck eller ansikte.',
  'passkeyPrompt.setUp': 'Kom igång',
  'passkeyPrompt.remindLater': 'Påminn mig senare',

  'credentials.title': 'Inloggningsuppgifter',
  'credentials.passkey': 'Nyckel',
  'credentials.apiKey': 'API-nyckel',
  'credentials.empty': 'Inga inloggningsuppgifter',
  'credentials.dismiss': 'Stäng',
  'credentials.deletePasskeyTitle': 'Ta bort nyckel',
  'credentials.revokeApiKeyTitle': 'Återkalla API-nyckel',
  'credentials.deleteMessage':
    'Det här tar bort <strong>{{name}}</strong> permanent. Åtgärden kan inte ångras.',
  'credentials.revokeMessage':
    'Det här återkallar <strong>{{name}}</strong> permanent. Åtgärden kan inte ångras.',
  'credentials.revokeKeyConfirm': 'Återkalla nyckeln',

  'apiKey.create.title': 'Skapa API-nyckel',
  'apiKey.create.warning':
    'Spara nyckeln på ett säkert ställe. Den fungerar som ditt lösenord och går inte att hämta igen när du stänger dialogrutan.',
  'apiKey.create.keyLabel': 'API-nyckel',
  'apiKey.create.expires': 'Går ut {{time}}',
  'apiKey.create.nameLabel': 'Namn på nyckeln',
  'apiKey.create.setExpiration': 'Ange giltighetstid',
  'apiKey.create.expiresAt': 'Går ut',
  'apiKey.create.error': 'Vi kunde inte skapa API-nyckeln. Försök igen.',
  'apiKey.create.submit': 'Skapa',

  'sessions.title': 'Sessioner',
  'sessions.signOut': 'Logga ut',
  'sessions.moreOptions': 'Fler utloggningsalternativ',
  'sessions.signOutEverywhere': 'Logga ut överallt',
  'sessions.created': 'Skapad {{time}}',
  'sessions.lastActive': 'Senast aktiv {{time}}',
  'sessions.expires': 'Går ut {{time}}',
  'sessions.revoke': 'Återkalla sessionen {{name}}',
  'sessions.empty': 'Inga aktiva sessioner',
  'sessions.revokeAll.title': 'Återkalla alla sessioner',
  'sessions.revokeAll.message':
    'Det här loggar ut dig från alla enheter, inklusive den här enheten.',
  'sessions.revokeAll.confirm': 'Återkalla sessioner',
};
