import type { Translations } from '../../types';
import type { enAdmin } from '../en/admin';

export const esAdmin: Translations<typeof enAdmin> = {
  'admin.title': 'Admin',
  'admin.nav.products': 'Productos',
  'admin.nav.groups': 'Grupos',
  'admin.nav.categories': 'Categorías',
  'admin.nav.users': 'Usuarios',

  'adminProducts.title': 'Productos',
  'adminProducts.error': 'No pudimos cargar los productos. Inténtalo más tarde.',
  'adminProducts.empty.title': 'Sin productos',

  'adminGroups.title': 'Grupos',
  'adminGroups.error': 'No pudimos cargar los grupos. Inténtalo más tarde.',
  'adminGroups.empty.title': 'Sin grupos',
  'adminGroups.itemCount_one': '{{count}} elemento',
  'adminGroups.itemCount_other': '{{count}} elementos',

  'adminCategories.title': 'Categorías',
  'adminCategories.error': 'No pudimos cargar las categorías. Inténtalo más tarde.',
  'adminCategories.empty.title': 'Sin categorías',

  'adminUsers.title': 'Usuarios',
  'adminUsers.error': 'No pudimos cargar los usuarios. Inténtalo más tarde.',
  'adminUsers.empty.title': 'Sin usuarios',
  'adminUsers.searchLabel': 'Buscar usuarios',
  'adminUsers.searchPlaceholder': 'Buscar usuarios...',
  'adminUsers.allUsers': 'Todos los usuarios',
  'adminUsers.role.admins': 'Administradores',
  'adminUsers.role.normal': 'Usuarios normales',

  'createProduct.title': 'Añadir producto',
  'createProduct.error': 'No pudimos crear el producto. Inténtalo de nuevo.',

  'createGroup.title': 'Añadir grupo',
  'createGroup.error': 'No pudimos crear el grupo. Inténtalo de nuevo.',

  'createUser.title': 'Añadir usuario',
  'createUser.created': 'Usuario creado',
  'createUser.tempKeyNotice':
    'Clave de API temporal para <strong>{{name}}</strong>. Guárdala ahora: caduca en 24 horas y no se puede recuperar después.',
  'createUser.username': 'Nombre de usuario',
  'createUser.displayName': 'Nombre visible',
  'createUser.email': 'Correo electrónico',
  'createUser.administrator': 'Administrador',
  'createUser.error': 'No pudimos crear el usuario. Inténtalo de nuevo.',
};
