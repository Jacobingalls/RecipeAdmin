import type { enSettings } from '../en/settings';

export const nlSettings: Record<keyof typeof enSettings, string> = {
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
  'language.name.nl': 'Nederlands',
};
