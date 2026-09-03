import type { Translations } from '../../types';
import type { enAuth } from '../en/auth';

export const esAuth: Translations<typeof enAuth> = {
  'login.signInWithPasskey': 'Iniciar sesión con clave de acceso',
  'login.signInWithApiKey': 'Iniciar sesión con clave de API',
  'login.usernameOrEmail': 'Nombre de usuario o correo',
  'login.apiKey': 'Clave de API',
  'login.submit': 'Iniciar sesión',
  'login.error.passkey': 'No pudimos iniciar sesión con la clave de acceso. Inténtalo de nuevo.',
  'login.error.credentials':
    'No pudimos iniciar sesión. Comprueba tus credenciales e inténtalo de nuevo.',

  'passkey.registerError': 'Algo salió mal al registrar tu clave de acceso. Inténtalo de nuevo.',
  'passkey.registerErrorTitle': 'Algo salió mal al registrar tu clave de acceso',
  'passkeyPrompt.title': 'Protege tu cuenta con una clave de acceso',
  'passkeyPrompt.description': 'Inicia sesión más rápido y seguro con tu huella o tu cara.',
  'passkeyPrompt.setUp': 'Configurar ahora',
  'passkeyPrompt.remindLater': 'Recordármelo más tarde',

  'credentials.title': 'Credenciales',
  'credentials.passkey': 'Clave de acceso',
  'credentials.apiKey': 'Clave de API',
  'credentials.empty': 'Sin credenciales',
  'credentials.dismiss': 'Descartar',
  'credentials.deletePasskeyTitle': 'Eliminar la clave de acceso',
  'credentials.revokeApiKeyTitle': 'Revocar la clave de API',
  'credentials.deleteMessage':
    'Esto eliminará <strong>{{name}}</strong> de forma permanente. La acción no se puede deshacer.',
  'credentials.revokeMessage':
    'Esto revocará <strong>{{name}}</strong> de forma permanente. La acción no se puede deshacer.',
  'credentials.revokeKeyConfirm': 'Revocar la clave',

  'apiKey.create.title': 'Crear clave de API',
  'apiKey.create.warning':
    'Guarda esta clave en un lugar seguro. Funciona como tu contraseña y no se puede recuperar una vez que cierres este cuadro de diálogo.',
  'apiKey.create.keyLabel': 'Clave de API',
  'apiKey.create.expires': 'Caduca {{time}}',
  'apiKey.create.nameLabel': 'Nombre de la clave',
  'apiKey.create.setExpiration': 'Definir la caducidad',
  'apiKey.create.expiresAt': 'Caduca el',
  'apiKey.create.error': 'No pudimos crear la clave de API. Inténtalo de nuevo.',
  'apiKey.create.submit': 'Crear',

  'sessions.title': 'Sesiones',
  'sessions.signOut': 'Cerrar sesión',
  'sessions.moreOptions': 'Más opciones para cerrar sesión',
  'sessions.signOutEverywhere': 'Cerrar sesión en todas partes',
  'sessions.created': 'Creada {{time}}',
  'sessions.lastActive': 'Actividad más reciente {{time}}',
  'sessions.expires': 'Caduca {{time}}',
  'sessions.revoke': 'Revocar la sesión {{name}}',
  'sessions.empty': 'Sin sesiones activas',
  'sessions.revokeAll.title': 'Revocar todas las sesiones',
  'sessions.revokeAll.message': 'Esto cerrará tu sesión en todos los dispositivos, incluido este.',
  'sessions.revokeAll.confirm': 'Revocar sesiones',
};
