import type { Messages } from './en';
import { nlAdmin } from './nl/admin';
import { nlAdminUser } from './nl/adminUser';
import { nlAuth } from './nl/auth';
import { nlCommon } from './nl/common';
import { nlEditor } from './nl/editor';
import { nlEntityEditors } from './nl/entityEditors';
import { nlFood } from './nl/food';
import { nlFormats } from './nl/formats';
import { nlHistory } from './nl/history';
import { nlHome } from './nl/home';
import { nlNav } from './nl/nav';
import { nlNutrients } from './nl/nutrients';
import { nlNutritionLabel } from './nl/nutrition';
import { nlSettings } from './nl/settings';
import { nlTimePicker } from './nl/timePicker';
import { nlUnits } from './nl/units';

/** Every message the app can show, in Dutch. */
export const nl: Messages = {
  ...nlCommon,
  ...nlFormats,
  ...nlNav,
  ...nlFood,
  ...nlHome,
  ...nlHistory,
  ...nlTimePicker,
  ...nlAuth,
  ...nlSettings,
  ...nlAdmin,
  ...nlAdminUser,
  ...nlEditor,
  ...nlEntityEditors,
  ...nlUnits,
  ...nlNutrients,
  ...nlNutritionLabel,
};
