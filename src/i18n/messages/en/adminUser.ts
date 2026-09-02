/** The admin user detail page: profile form, credentials and account actions. */
export const enAdminUser = {
  'adminUser.error': "Couldn't load this user. Try again later.",
  'adminUser.notFound': 'User not found',
  'adminUser.created': 'Created {date}',

  'adminUser.profile': 'Profile',
  'adminUser.username': 'Username',
  'adminUser.displayName': 'Display Name',
  'adminUser.email': 'Email',
  'adminUser.administrator': 'Administrator',
  'adminUser.updateError': "Couldn't update this user. Try again.",

  'adminUser.credentials': 'Credentials',
  'adminUser.generateTempKey': 'Generate Temporary API Key',
  'adminUser.noCredentials': 'No credentials.',
  'adminUser.tempKey.title': 'Temporary API Key',
  'adminUser.tempKey.ariaLabel': 'Temporary API key',
  'adminUser.tempKey.keyLabel': 'API Key',
  'adminUser.tempKey.expires': 'Expires {date}',
  'adminUser.tempKey.generating': 'Generating...',

  'adminUser.accountActions': 'Account actions',
  'adminUser.sessionsRevoked.title': 'All sessions revoked',
  'adminUser.sessionsRevoked.description':
    'Active sessions may remain valid briefly until their current access token expires.',
  'adminUser.sessionsRevoked.dismiss': 'Dismiss',
  'adminUser.revokeSessions.title': 'Revoke all sessions',
  'adminUser.revokeSessions.description': 'Log this user out of all devices immediately.',
  'adminUser.revokeSessions.action': 'Revoke sessions',
  'adminUser.revokeSessions.confirm':
    'Revoke all sessions for {name}? They will be logged out of all devices.',
  'adminUser.revokeSessions.error': "Couldn't revoke sessions. Try again.",
  'adminUser.delete.title': 'Delete this user',
  'adminUser.delete.description':
    "This will permanently delete this user and all their data. This can't be undone.",
  'adminUser.delete.action': 'Delete user',
  'adminUser.delete.modalTitle': 'Delete user',
  'adminUser.delete.message': 'This will permanently delete {name}. This action cannot be undone.',
  'adminUser.delete.confirm': 'Delete this user',
  'adminUser.delete.error': "Couldn't delete this user. Try again.",
};
