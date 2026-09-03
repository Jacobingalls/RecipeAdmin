import type { Translations } from '../../types';
import type { enAdminUser } from '../en/adminUser';

export const daAdminUser: Translations<typeof enAdminUser> = {
  'adminUser.error': 'Vi kunne ikke indlæse denne bruger. Prøv igen senere.',
  'adminUser.notFound': 'Brugeren blev ikke fundet',
  'adminUser.created': 'Oprettet {{date}}',

  'adminUser.profile': 'Profil',
  'adminUser.username': 'Brugernavn',
  'adminUser.displayName': 'Vist navn',
  'adminUser.email': 'E-mail',
  'adminUser.administrator': 'Administrator',
  'adminUser.updateError': 'Vi kunne ikke opdatere denne bruger. Prøv igen.',

  'adminUser.credentials': 'Loginoplysninger',
  'adminUser.generateTempKey': 'Opret midlertidig API-nøgle',
  'adminUser.noCredentials': 'Ingen loginoplysninger.',
  'adminUser.tempKey.title': 'Midlertidig API-nøgle',
  'adminUser.tempKey.ariaLabel': 'Midlertidig API-nøgle',
  'adminUser.tempKey.keyLabel': 'API-nøgle',
  'adminUser.tempKey.expires': 'Udløber {{date}}',
  'adminUser.tempKey.generating': 'Opretter...',

  'adminUser.accountActions': 'Kontohandlinger',
  'adminUser.sessionsRevoked.title': 'Alle sessioner er tilbagekaldt',
  'adminUser.sessionsRevoked.description':
    'Aktive sessioner kan være gyldige et kort stykke tid endnu, indtil deres adgangstoken udløber.',
  'adminUser.sessionsRevoked.dismiss': 'Luk',
  'adminUser.revokeSessions.title': 'Tilbagekald alle sessioner',
  'adminUser.revokeSessions.description': 'Log brugeren ud på alle enheder med det samme.',
  'adminUser.revokeSessions.action': 'Tilbagekald sessioner',
  'adminUser.revokeSessions.confirm':
    'Vil du tilbagekalde alle sessioner for <strong>{{name}}</strong>? Brugeren bliver logget ud på alle enheder.',
  'adminUser.revokeSessions.error': 'Vi kunne ikke tilbagekalde sessionerne. Prøv igen.',
  'adminUser.delete.title': 'Slet denne bruger',
  'adminUser.delete.description':
    'Dette sletter brugeren og alle deres data permanent. Det kan ikke fortrydes.',
  'adminUser.delete.action': 'Slet bruger',
  'adminUser.delete.modalTitle': 'Slet bruger',
  'adminUser.delete.message':
    'Dette sletter <strong>{{name}}</strong> permanent. Handlingen kan ikke fortrydes.',
  'adminUser.delete.confirm': 'Slet denne bruger',
  'adminUser.delete.error': 'Vi kunne ikke slette denne bruger. Prøv igen.',
};
