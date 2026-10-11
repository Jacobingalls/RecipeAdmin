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

  'labelStyle.title': 'Næringsdeklaration',
  'labelStyle.description':
    'Vi følger dit sprog, medmindre du vælger noget her. Europæiske deklarationer måler energi i kilojoule, angiver mængder pr. 100 g og oplyser salt i stedet for natrium.',
  'labelStyle.selectLabel': 'Næringsdeklaration',
  'labelStyle.system': 'Følg dit sprog',
  'labelStyle.us': 'Amerikansk (kalorier, % af daglig værdi)',
  'labelStyle.european': 'Europæisk (kilojoule, pr. 100 g)',
  'assistant.title': 'Forbind en AI-assistent',
  'assistant.description': 'Brug dine opskrifter og din madlog fra en assistent som Claude.',
  'assistant.urlLabel': 'MCP-serverens URL',
  'assistant.copyUrl': 'Kopiér URL',
  'assistant.copyCommand': 'Kopiér kommando',
  'assistant.claude.title': 'Claude',
  'assistant.claude.instructions':
    'Tilføj en brugerdefineret connector med denne URL i Claude på nettet, computeren eller mobilen. Du bliver bedt om at godkende adgangen.',
  'assistant.agents.title': 'Claude Code og andre agenter',
  'assistant.agents.instructions':
    'Kør denne kommando, og erstat {{placeholder}} med en nøgle, du opretter under Loginoplysninger ovenfor.',
  'assistant.sessionsNote':
    'Tilknyttede apps vises under Sessioner, hvor du når som helst kan tilbagekalde deres adgang.',
};
