import type { Messages } from './en';
import { svAdmin } from './sv/admin';
import { svAdminUser } from './sv/adminUser';
import { svAuth } from './sv/auth';
import { svCommon } from './sv/common';
import { svEditor } from './sv/editor';
import { svEntityEditors } from './sv/entityEditors';
import { svFood } from './sv/food';
import { svFormats } from './sv/formats';
import { svHistory } from './sv/history';
import { svHome } from './sv/home';
import { svNav } from './sv/nav';
import { svNutrients } from './sv/nutrients';
import { svNutritionLabel } from './sv/nutrition';
import { svSettings } from './sv/settings';
import { svTimePicker } from './sv/timePicker';
import { svUnits } from './sv/units';

/** Every message the app can show, in Swedish. */
export const sv: Messages = {
  ...svCommon,
  ...svFormats,
  ...svNav,
  ...svFood,
  ...svHome,
  ...svHistory,
  ...svTimePicker,
  ...svAuth,
  ...svSettings,
  ...svAdmin,
  ...svAdminUser,
  ...svEditor,
  ...svEntityEditors,
  ...svUnits,
  ...svNutrients,
  ...svNutritionLabel,
};
