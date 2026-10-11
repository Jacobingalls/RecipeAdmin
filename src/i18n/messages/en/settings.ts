/** The settings page: profile, language, energy and the errors shown while loading it. */
export const enSettings = {
  'settings.title': 'Settings',
  'settings.error.passkeys': "Couldn't load passkeys.",
  'settings.error.apiKeys': "Couldn't load API keys.",
  'settings.error.sessions': "Couldn't load sessions.",

  'profile.title': 'Profile',
  'profile.updated': 'Display name updated.',
  'profile.username': 'Username',
  'profile.displayName': 'Display Name',
  'profile.displayNameLabel': 'Display name',
  'profile.email': 'Email',
  'profile.editDisplayName': 'Edit display name',
  'profile.error': "Couldn't update your profile. Try again.",

  'language.title': 'Language',
  'language.description': "We'll use your browser's language unless you pick one here.",
  'language.selectLabel': 'Language',
  'language.system': 'Follow your browser',
  'language.name.en': 'English',
  'language.name.da': 'Dansk',
  'language.name.es': 'Español',
  'language.name.nl': 'Nederlands',
  'language.name.sv': 'Svenska',

  'labelStyle.title': 'Nutrition label',
  'labelStyle.description':
    "We'll match your language unless you pick one here. European labels measure energy in kilojoules, give amounts per 100 g, and report salt instead of sodium.",
  'labelStyle.selectLabel': 'Nutrition label',
  'labelStyle.system': 'Follow your language',
  'labelStyle.us': 'US (calories, % daily value)',
  'labelStyle.european': 'European (kilojoules, per 100 g)',
  'assistant.title': 'Connect an AI assistant',
  'assistant.description': 'Use your recipes and food log from an assistant like Claude.',
  'assistant.urlLabel': 'MCP server URL',
  'assistant.copyUrl': 'Copy URL',
  'assistant.copyCommand': 'Copy command',
  'assistant.claude.title': 'Claude',
  'assistant.claude.instructions':
    "In Claude on the web, desktop or mobile, add a custom connector with this URL. You'll be asked to approve access.",
  'assistant.agents.title': 'Claude Code and other agents',
  'assistant.agents.instructions':
    'Run this command, replacing {{placeholder}} with a key you create under Credentials above.',
  'assistant.sessionsNote':
    'Connected apps appear under Sessions, where you can revoke their access at any time.',
};
