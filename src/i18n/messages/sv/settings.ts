import type { Translations } from '../../types';
import type { enSettings } from '../en/settings';

export const svSettings: Translations<typeof enSettings> = {
  'settings.title': 'Inställningar',
  'settings.error.passkeys': 'Vi kunde inte ladda dina nycklar.',
  'settings.error.apiKeys': 'Vi kunde inte ladda dina API-nycklar.',
  'settings.error.sessions': 'Vi kunde inte ladda dina sessioner.',

  'profile.title': 'Profil',
  'profile.updated': 'Visningsnamnet är uppdaterat.',
  'profile.username': 'Användarnamn',
  'profile.displayName': 'Visningsnamn',
  'profile.displayNameLabel': 'Visningsnamn',
  'profile.email': 'E-post',
  'profile.editDisplayName': 'Redigera visningsnamn',
  'profile.error': 'Vi kunde inte uppdatera din profil. Försök igen.',

  'language.title': 'Språk',
  'language.description': 'Vi använder webbläsarens språk om du inte väljer ett här.',
  'language.selectLabel': 'Språk',
  'language.system': 'Följ webbläsaren',
  'language.name.en': 'English',
  'language.name.da': 'Dansk',
  'language.name.es': 'Español',
  'language.name.nl': 'Nederlands',
  'language.name.sv': 'Svenska',

  'energy.title': 'Energi',
  'energy.description':
    'Vi följer ditt språk om du inte väljer något här. Europeiska språk läser energi i kilojoule.',
  'energy.selectLabel': 'Energi',
  'energy.system': 'Följ ditt språk',
  'energy.calories': 'Kalorier (kcal)',
  'energy.kilojoules': 'Kilojoule (kJ)',
};
