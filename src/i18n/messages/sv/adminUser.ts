import type { Translations } from '../../types';
import type { enAdminUser } from '../en/adminUser';

export const svAdminUser: Translations<typeof enAdminUser> = {
  'adminUser.error': 'Vi kunde inte ladda användaren. Försök igen senare.',
  'adminUser.notFound': 'Användaren hittades inte',
  'adminUser.created': 'Skapad {{date}}',

  'adminUser.profile': 'Profil',
  'adminUser.username': 'Användarnamn',
  'adminUser.displayName': 'Visningsnamn',
  'adminUser.email': 'E-post',
  'adminUser.administrator': 'Administratör',
  'adminUser.updateError': 'Vi kunde inte uppdatera användaren. Försök igen.',

  'adminUser.credentials': 'Inloggningsuppgifter',
  'adminUser.generateTempKey': 'Skapa tillfällig API-nyckel',
  'adminUser.noCredentials': 'Inga inloggningsuppgifter.',
  'adminUser.tempKey.title': 'Tillfällig API-nyckel',
  'adminUser.tempKey.ariaLabel': 'Tillfällig API-nyckel',
  'adminUser.tempKey.keyLabel': 'API-nyckel',
  'adminUser.tempKey.expires': 'Går ut {{date}}',
  'adminUser.tempKey.generating': 'Skapar...',

  'adminUser.accountActions': 'Kontoåtgärder',
  'adminUser.sessionsRevoked.title': 'Alla sessioner är återkallade',
  'adminUser.sessionsRevoked.description':
    'Aktiva sessioner kan fortsätta att gälla en kort stund tills deras åtkomsttoken går ut.',
  'adminUser.sessionsRevoked.dismiss': 'Stäng',
  'adminUser.revokeSessions.title': 'Återkalla alla sessioner',
  'adminUser.revokeSessions.description': 'Logga ut användaren från alla enheter direkt.',
  'adminUser.revokeSessions.action': 'Återkalla sessioner',
  'adminUser.revokeSessions.confirm':
    'Vill du återkalla alla sessioner för <strong>{{name}}</strong>? Användaren loggas ut från alla enheter.',
  'adminUser.revokeSessions.error': 'Vi kunde inte återkalla sessionerna. Försök igen.',
  'adminUser.delete.title': 'Ta bort användaren',
  'adminUser.delete.description':
    'Det här tar bort användaren och all data permanent. Åtgärden kan inte ångras.',
  'adminUser.delete.action': 'Ta bort användare',
  'adminUser.delete.modalTitle': 'Ta bort användare',
  'adminUser.delete.message':
    'Det här tar bort <strong>{{name}}</strong> permanent. Åtgärden kan inte ångras.',
  'adminUser.delete.confirm': 'Ta bort användaren',
  'adminUser.delete.error': 'Vi kunde inte ta bort användaren. Försök igen.',
};
