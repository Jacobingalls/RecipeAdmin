import type { Translations } from '../../types';
import type { enAdminUser } from '../en/adminUser';

export const esAdminUser: Translations<typeof enAdminUser> = {
  'adminUser.error': 'No pudimos cargar este usuario. Inténtalo más tarde.',
  'adminUser.notFound': 'Usuario no encontrado',
  'adminUser.created': 'Creado el {{date}}',

  'adminUser.profile': 'Perfil',
  'adminUser.username': 'Nombre de usuario',
  'adminUser.displayName': 'Nombre visible',
  'adminUser.email': 'Correo electrónico',
  'adminUser.administrator': 'Administrador',
  'adminUser.updateError': 'No pudimos actualizar este usuario. Inténtalo de nuevo.',

  'adminUser.credentials': 'Credenciales',
  'adminUser.generateTempKey': 'Generar clave de API temporal',
  'adminUser.noCredentials': 'Sin credenciales.',
  'adminUser.tempKey.title': 'Clave de API temporal',
  'adminUser.tempKey.ariaLabel': 'Clave de API temporal',
  'adminUser.tempKey.keyLabel': 'Clave de API',
  'adminUser.tempKey.expires': 'Caduca el {{date}}',
  'adminUser.tempKey.generating': 'Generando...',

  'adminUser.accountActions': 'Acciones de la cuenta',
  'adminUser.sessionsRevoked.title': 'Todas las sesiones revocadas',
  'adminUser.sessionsRevoked.description':
    'Las sesiones activas pueden seguir siendo válidas un momento, hasta que caduque su token de acceso.',
  'adminUser.sessionsRevoked.dismiss': 'Descartar',
  'adminUser.revokeSessions.title': 'Revocar todas las sesiones',
  'adminUser.revokeSessions.description':
    'Cierra la sesión de este usuario en todos los dispositivos al instante.',
  'adminUser.revokeSessions.action': 'Revocar sesiones',
  'adminUser.revokeSessions.confirm':
    '¿Revocar todas las sesiones de <strong>{{name}}</strong>? Se cerrará su sesión en todos los dispositivos.',
  'adminUser.revokeSessions.error': 'No pudimos revocar las sesiones. Inténtalo de nuevo.',
  'adminUser.delete.title': 'Eliminar este usuario',
  'adminUser.delete.description':
    'Esto eliminará de forma permanente este usuario y todos sus datos. No se puede deshacer.',
  'adminUser.delete.action': 'Eliminar usuario',
  'adminUser.delete.modalTitle': 'Eliminar usuario',
  'adminUser.delete.message':
    'Esto eliminará <strong>{{name}}</strong> de forma permanente. La acción no se puede deshacer.',
  'adminUser.delete.confirm': 'Eliminar este usuario',
  'adminUser.delete.error': 'No pudimos eliminar este usuario. Inténtalo de nuevo.',
};
