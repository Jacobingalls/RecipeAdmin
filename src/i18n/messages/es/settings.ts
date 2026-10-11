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

  'labelStyle.title': 'Información nutricional',
  'labelStyle.description':
    'Seguimos tu idioma a menos que elijas algo aquí. Las etiquetas europeas miden la energía en kilojulios, indican las cantidades por 100 g y declaran sal en lugar de sodio.',
  'labelStyle.selectLabel': 'Información nutricional',
  'labelStyle.system': 'Seguir tu idioma',
  'labelStyle.us': 'Estadounidense (calorías, % del valor diario)',
  'labelStyle.european': 'Europea (kilojulios, por 100 g)',
  'assistant.title': 'Conecta un asistente de IA',
  'assistant.description':
    'Usa tus recetas y tu registro de comidas desde un asistente como Claude.',
  'assistant.urlLabel': 'URL del servidor MCP',
  'assistant.copyUrl': 'Copiar URL',
  'assistant.copyCommand': 'Copiar comando',
  'assistant.claude.title': 'Claude',
  'assistant.claude.instructions':
    'En Claude para web, escritorio o móvil, añade un conector personalizado con esta URL. Te pediremos que apruebes el acceso.',
  'assistant.agents.title': 'Claude Code y otros agentes',
  'assistant.agents.instructions':
    'Ejecuta este comando y sustituye {{placeholder}} por una clave que crees en Credenciales, más arriba.',
  'assistant.sessionsNote':
    'Las apps conectadas aparecen en Sesiones, donde puedes revocar su acceso cuando quieras.',
};
