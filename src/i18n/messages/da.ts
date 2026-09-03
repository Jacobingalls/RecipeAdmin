import type { Messages } from './en';
import { daAdmin } from './da/admin';
import { daAdminUser } from './da/adminUser';
import { daAuth } from './da/auth';
import { daCommon } from './da/common';
import { daEditor } from './da/editor';
import { daEntityEditors } from './da/entityEditors';
import { daFood } from './da/food';
import { daFormats } from './da/formats';
import { daHistory } from './da/history';
import { daHome } from './da/home';
import { daNav } from './da/nav';
import { daNutrients } from './da/nutrients';
import { daNutritionLabel } from './da/nutrition';
import { daSettings } from './da/settings';
import { daTimePicker } from './da/timePicker';
import { daUnits } from './da/units';

/** Every message the app can show, in Danish. */
export const da: Messages = {
  ...daCommon,
  ...daFormats,
  ...daNav,
  ...daFood,
  ...daHome,
  ...daHistory,
  ...daTimePicker,
  ...daAuth,
  ...daSettings,
  ...daAdmin,
  ...daAdminUser,
  ...daEditor,
  ...daEntityEditors,
  ...daUnits,
  ...daNutrients,
  ...daNutritionLabel,
};
