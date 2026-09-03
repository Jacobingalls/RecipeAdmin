import type { Messages } from './en';
import { esAdmin } from './es/admin';
import { esAdminUser } from './es/adminUser';
import { esAuth } from './es/auth';
import { esCommon } from './es/common';
import { esEditor } from './es/editor';
import { esEntityEditors } from './es/entityEditors';
import { esFood } from './es/food';
import { esFormats } from './es/formats';
import { esHistory } from './es/history';
import { esHome } from './es/home';
import { esNav } from './es/nav';
import { esNutrients } from './es/nutrients';
import { esNutritionLabel } from './es/nutrition';
import { esSettings } from './es/settings';
import { esTimePicker } from './es/timePicker';
import { esUnits } from './es/units';

/** Every message the app can show, in Spanish. */
export const es: Messages = {
  ...esCommon,
  ...esFormats,
  ...esNav,
  ...esFood,
  ...esHome,
  ...esHistory,
  ...esTimePicker,
  ...esAuth,
  ...esSettings,
  ...esAdmin,
  ...esAdminUser,
  ...esEditor,
  ...esEntityEditors,
  ...esUnits,
  ...esNutrients,
  ...esNutritionLabel,
};
