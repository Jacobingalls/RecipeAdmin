import type { Translations } from '../../types';
import type { enSettings } from '../en/settings';

export const nlSettings: Translations<typeof enSettings> = {
  'settings.title': 'Instellingen',
  'settings.error.passkeys': 'We konden je passkeys niet laden.',
  'settings.error.apiKeys': 'We konden je API-sleutels niet laden.',
  'settings.error.sessions': 'We konden je sessies niet laden.',

  'profile.title': 'Profiel',
  'profile.updated': 'Je weergavenaam is bijgewerkt.',
  'profile.username': 'Gebruikersnaam',
  'profile.displayName': 'Weergavenaam',
  'profile.displayNameLabel': 'Weergavenaam',
  'profile.email': 'E-mailadres',
  'profile.editDisplayName': 'Weergavenaam bewerken',
  'profile.error': 'Je profiel bijwerken is niet gelukt. Probeer het opnieuw.',

  'language.title': 'Taal',
  'language.description': 'We gebruiken de taal van je browser, tenzij je hier een taal kiest.',
  'language.selectLabel': 'Taal',
  'language.system': 'Browsertaal volgen',
  'language.name.en': 'English',
  'language.name.da': 'Dansk',
  'language.name.es': 'Español',
  'language.name.nl': 'Nederlands',
  'language.name.sv': 'Svenska',

  'energy.title': 'Energie',
  'energy.description':
    'We volgen je taal, tenzij je hier iets kiest. Europese talen lezen energie in kilojoules.',
  'energy.selectLabel': 'Energie',
  'energy.system': 'Je taal volgen',
  'energy.calories': 'Calorieën (kcal)',
  'energy.kilojoules': 'Kilojoules (kJ)',
};
