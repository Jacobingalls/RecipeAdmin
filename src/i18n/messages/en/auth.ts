/** Signing in, passkeys, API keys and sessions. */
export const enAuth = {
  'login.signInWithPasskey': 'Sign in with passkey',
  'login.signInWithApiKey': 'Sign in with API key',
  'login.usernameOrEmail': 'Username or email',
  'login.apiKey': 'API key',
  'login.submit': 'Sign in',
  'login.error.passkey': "Couldn't sign in with passkey. Try again.",
  'login.error.credentials': "Couldn't sign in. Check your credentials and try again.",

  'passkey.registerError': 'Something went wrong registering your passkey. Try again.',
  'passkey.registerErrorTitle': 'Something went wrong registering your passkey',
  'passkeyPrompt.title': 'Secure your account with a passkey',
  'passkeyPrompt.description': 'Sign in faster and more securely with your fingerprint or face.',
  'passkeyPrompt.setUp': 'Set up now',
  'passkeyPrompt.remindLater': 'Remind me later',

  'credentials.title': 'Credentials',
  'credentials.passkey': 'Passkey',
  'credentials.apiKey': 'API Key',
  'credentials.empty': 'No credentials',
  'credentials.dismiss': 'Dismiss',
  'credentials.deletePasskeyTitle': 'Delete passkey',
  'credentials.revokeApiKeyTitle': 'Revoke API key',
  'credentials.deleteMessage':
    'This will permanently delete <strong>{{name}}</strong>. This action cannot be undone.',
  'credentials.revokeMessage':
    'This will permanently revoke <strong>{{name}}</strong>. This action cannot be undone.',
  'credentials.revokeKeyConfirm': 'Revoke key',

  'apiKey.create.title': 'Create API Key',
  'apiKey.create.warning':
    'Make sure to save this key somewhere safe. It acts as your password and can’t be retrieved once you close this dialog.',
  'apiKey.create.keyLabel': 'API Key',
  'apiKey.create.expires': 'Expires {{time}}',
  'apiKey.create.nameLabel': 'Key Name',
  'apiKey.create.setExpiration': 'Set expiration',
  'apiKey.create.expiresAt': 'Expires at',
  'apiKey.create.error': "Couldn't create the API key. Try again.",
  'apiKey.create.submit': 'Create',

  'sessions.title': 'Sessions',
  'sessions.signOut': 'Sign out',
  'sessions.moreOptions': 'More sign out options',
  'sessions.signOutEverywhere': 'Sign out everywhere',
  'sessions.created': 'Created {{time}}',
  'sessions.lastActive': 'Last active {{time}}',
  'sessions.expires': 'Expires {{time}}',
  'sessions.revoke': 'Revoke session {{name}}',
  'sessions.empty': 'No active sessions',
  'sessions.revokeAll.title': 'Revoke all sessions',
  'sessions.revokeAll.message': 'This will sign you out of all devices, including this one.',
  'sessions.revokeAll.confirm': 'Revoke sessions',
};
