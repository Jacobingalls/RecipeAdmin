import type { Translations } from '../../types';
import type { enCommon } from '../en/common';

export const esCommon: Translations<typeof enCommon> = {
  'common.loading': 'Cargando',
  'common.loadingEllipsis': 'Cargando...',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.close': 'Cerrar',
  'common.delete': 'Eliminar',
  'common.remove': 'Quitar',
  'common.add': 'Añadir',
  'common.done': 'Listo',
  'common.copy': 'Copiar',
  'common.copied': '¡Copiado!',
  'common.tryAgain': 'Inténtalo de nuevo',
  'common.moreActions': 'Más acciones',
  'common.name': 'Nombre',
  'common.brand': 'Marca',
  'common.none': 'Ninguno',
  'common.unknown': 'Desconocido',
  'common.optional': 'Opcional',

  'error.unexpected.title': 'Algo salió mal',
  'error.unexpected.description': 'Se produjo un error inesperado',

  'confirm.confirm': 'Confirmar',
  'confirm.typeToConfirm': 'Escribe <strong>{{name}}</strong> para confirmar',

  'filter.byName': 'Filtrar por nombre',
  'filter.searchByName': 'Buscar por nombre...',
  'filter.allBrands': 'Todas las marcas',

  'list.new': 'Nuevo',
  'list.adjustFilters': 'Prueba a ajustar la búsqueda o los filtros.',
  'list.adjustSearch': 'Prueba a ajustar la búsqueda.',

  'credential.created': 'Creada {{time}}',
  'credential.expires': 'Caduca {{time}}',
  'credential.expired': 'Caducó {{time}}',
  'credential.deletePasskey': 'Eliminar la clave de acceso {{name}}',
  'credential.revokeApiKey': 'Revocar la clave de API {{name}}',
};
