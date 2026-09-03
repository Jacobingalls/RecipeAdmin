import type { enAuth } from '../en/auth';

export const nlAuth: Record<keyof typeof enAuth, string> = {
  'login.signInWithPasskey': 'Inloggen met passkey',
  'login.signInWithApiKey': 'Inloggen met API-sleutel',
  'login.usernameOrEmail': 'Gebruikersnaam of e-mailadres',
  'login.apiKey': 'API-sleutel',
  'login.submit': 'Inloggen',
  'login.error.passkey': 'Inloggen met je passkey is niet gelukt. Probeer het opnieuw.',
  'login.error.credentials':
    'Inloggen is niet gelukt. Controleer je gegevens en probeer het opnieuw.',

  'passkey.registerError':
    'Er ging iets mis bij het registreren van je passkey. Probeer het opnieuw.',
  'passkey.registerErrorTitle': 'Er ging iets mis bij het registreren van je passkey',
  'passkeyPrompt.title': 'Beveilig je account met een passkey',
  'passkeyPrompt.description': 'Log sneller en veiliger in met je vingerafdruk of gezicht.',
  'passkeyPrompt.setUp': 'Nu instellen',
  'passkeyPrompt.remindLater': 'Herinner me later',

  'credentials.title': 'Inloggegevens',
  'credentials.passkey': 'Passkey',
  'credentials.apiKey': 'API-sleutel',
  'credentials.empty': 'Geen inloggegevens',
  'credentials.dismiss': 'Sluiten',
  'credentials.deletePasskeyTitle': 'Passkey verwijderen',
  'credentials.revokeApiKeyTitle': 'API-sleutel intrekken',
  'credentials.deleteMessage':
    'Hiermee verwijder je <strong>{{name}}</strong> definitief. Dit kun je niet ongedaan maken.',
  'credentials.revokeMessage':
    'Hiermee trek je <strong>{{name}}</strong> definitief in. Dit kun je niet ongedaan maken.',
  'credentials.revokeKeyConfirm': 'Sleutel intrekken',

  'apiKey.create.title': 'API-sleutel aanmaken',
  'apiKey.create.warning':
    'Bewaar deze sleutel op een veilige plek. Hij werkt als je wachtwoord en is niet meer op te vragen zodra je dit venster sluit.',
  'apiKey.create.keyLabel': 'API-sleutel',
  'apiKey.create.expires': 'Verloopt {{time}}',
  'apiKey.create.nameLabel': 'Naam van de sleutel',
  'apiKey.create.setExpiration': 'Vervaldatum instellen',
  'apiKey.create.expiresAt': 'Verloopt op',
  'apiKey.create.error': 'Het aanmaken van de API-sleutel is niet gelukt. Probeer het opnieuw.',
  'apiKey.create.submit': 'Aanmaken',

  'sessions.title': 'Sessies',
  'sessions.signOut': 'Uitloggen',
  'sessions.moreOptions': 'Meer uitlogopties',
  'sessions.signOutEverywhere': 'Overal uitloggen',
  'sessions.created': 'Aangemaakt {{time}}',
  'sessions.lastActive': 'Laatst actief {{time}}',
  'sessions.expires': 'Verloopt {{time}}',
  'sessions.revoke': 'Sessie {{name}} intrekken',
  'sessions.empty': 'Geen actieve sessies',
  'sessions.revokeAll.title': 'Alle sessies intrekken',
  'sessions.revokeAll.message': 'Hiermee log je uit op al je apparaten, ook op dit apparaat.',
  'sessions.revokeAll.confirm': 'Sessies intrekken',
};
