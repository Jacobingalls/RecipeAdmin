import type { Translations } from '../../types';
import type { enSettings } from '../en/settings';

export const esSettings: Translations<typeof enSettings> = {
  'settings.title': 'Ajustes',
  'settings.error.passkeys': 'No pudimos cargar tus claves de acceso.',
  'settings.error.apiKeys': 'No pudimos cargar tus claves de API.',
  'settings.error.sessions': 'No pudimos cargar tus sesiones.',

  'profile.title': 'Perfil',
  'profile.updated': 'Tu nombre visible se ha actualizado.',
  'profile.username': 'Nombre de usuario',
  'profile.displayName': 'Nombre visible',
  'profile.displayNameLabel': 'Nombre visible',
  'profile.email': 'Correo electrónico',
  'profile.editDisplayName': 'Editar el nombre visible',
  'profile.error': 'No pudimos actualizar tu perfil. Inténtalo de nuevo.',

  'language.title': 'Idioma',
  'language.description': 'Usamos el idioma de tu navegador salvo que elijas uno aquí.',
  'language.selectLabel': 'Idioma',
  'language.system': 'Seguir al navegador',
  'language.name.en': 'English',
  'language.name.da': 'Dansk',
  'language.name.es': 'Español',
  'language.name.nl': 'Nederlands',
  'language.name.sv': 'Svenska',
};
