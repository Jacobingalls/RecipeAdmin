import type { Translations } from '../../types';
import type { enSettings } from '../en/settings';

export const daSettings: Translations<typeof enSettings> = {
  'settings.title': 'Indstillinger',
  'settings.error.passkeys': 'Vi kunne ikke indlæse dine adgangsnøgler.',
  'settings.error.apiKeys': 'Vi kunne ikke indlæse dine API-nøgler.',
  'settings.error.sessions': 'Vi kunne ikke indlæse dine sessioner.',

  'profile.title': 'Profil',
  'profile.updated': 'Dit viste navn er opdateret.',
  'profile.username': 'Brugernavn',
  'profile.displayName': 'Vist navn',
  'profile.displayNameLabel': 'Vist navn',
  'profile.email': 'E-mail',
  'profile.editDisplayName': 'Rediger vist navn',
  'profile.error': 'Vi kunne ikke opdatere din profil. Prøv igen.',

  'language.title': 'Sprog',
  'language.description': 'Vi bruger din browsers sprog, medmindre du vælger et her.',
  'language.selectLabel': 'Sprog',
  'language.system': 'Følg din browser',
  'language.name.en': 'English',
  'language.name.da': 'Dansk',
  'language.name.es': 'Español',
  'language.name.nl': 'Nederlands',
  'language.name.sv': 'Svenska',
};
