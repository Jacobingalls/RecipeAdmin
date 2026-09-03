import type { Translations } from '../../types';
import type { enAdminUser } from '../en/adminUser';

export const nlAdminUser: Translations<typeof enAdminUser> = {
  'adminUser.error': 'We konden deze gebruiker niet laden. Probeer het later opnieuw.',
  'adminUser.notFound': 'Gebruiker niet gevonden',
  'adminUser.created': 'Aangemaakt op {{date}}',

  'adminUser.profile': 'Profiel',
  'adminUser.username': 'Gebruikersnaam',
  'adminUser.displayName': 'Weergavenaam',
  'adminUser.email': 'E-mailadres',
  'adminUser.administrator': 'Beheerder',
  'adminUser.updateError': 'Deze gebruiker bijwerken is niet gelukt. Probeer het opnieuw.',

  'adminUser.credentials': 'Inloggegevens',
  'adminUser.generateTempKey': 'Tijdelijke API-sleutel genereren',
  'adminUser.noCredentials': 'Geen inloggegevens.',
  'adminUser.tempKey.title': 'Tijdelijke API-sleutel',
  'adminUser.tempKey.ariaLabel': 'Tijdelijke API-sleutel',
  'adminUser.tempKey.keyLabel': 'API-sleutel',
  'adminUser.tempKey.expires': 'Verloopt op {{date}}',
  'adminUser.tempKey.generating': 'Genereren...',

  'adminUser.accountActions': 'Accountacties',
  'adminUser.sessionsRevoked.title': 'Alle sessies zijn ingetrokken',
  'adminUser.sessionsRevoked.description':
    'Actieve sessies blijven nog even geldig totdat hun huidige toegangstoken verloopt.',
  'adminUser.sessionsRevoked.dismiss': 'Sluiten',
  'adminUser.revokeSessions.title': 'Alle sessies intrekken',
  'adminUser.revokeSessions.description': 'Log deze gebruiker direct uit op alle apparaten.',
  'adminUser.revokeSessions.action': 'Sessies intrekken',
  'adminUser.revokeSessions.confirm':
    'Alle sessies voor <strong>{{name}}</strong> intrekken? Deze gebruiker wordt op alle apparaten uitgelogd.',
  'adminUser.revokeSessions.error': 'De sessies intrekken is niet gelukt. Probeer het opnieuw.',
  'adminUser.delete.title': 'Deze gebruiker verwijderen',
  'adminUser.delete.description':
    'Hiermee verwijder je deze gebruiker en alle bijbehorende gegevens definitief. Dit kun je niet ongedaan maken.',
  'adminUser.delete.action': 'Gebruiker verwijderen',
  'adminUser.delete.modalTitle': 'Gebruiker verwijderen',
  'adminUser.delete.message':
    'Hiermee verwijder je <strong>{{name}}</strong> definitief. Dit kun je niet ongedaan maken.',
  'adminUser.delete.confirm': 'Deze gebruiker verwijderen',
  'adminUser.delete.error': 'Deze gebruiker verwijderen is niet gelukt. Probeer het opnieuw.',
};
