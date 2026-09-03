import { enAdmin } from './en/admin';
import { enAdminUser } from './en/adminUser';
import { enAuth } from './en/auth';
import { enCommon } from './en/common';
import { enEditor } from './en/editor';
import { enEntityEditors } from './en/entityEditors';
import { enFood } from './en/food';
import { enFormats } from './en/formats';
import { enHistory } from './en/history';
import { enHome } from './en/home';
import { enNav } from './en/nav';
import { enNutrients } from './en/nutrients';
import { enNutritionLabel } from './en/nutrition';
import { enSettings } from './en/settings';
import { enTimePicker } from './en/timePicker';
import { enUnits } from './en/units';

/**
 * Every message the app can show, in English.
 *
 * This object defines the set of message keys — `nl` is typed against it, so a translation
 * that's missing or misspelled fails to compile.
 */
export const en = {
  ...enCommon,
  ...enFormats,
  ...enNav,
  ...enFood,
  ...enHome,
  ...enHistory,
  ...enTimePicker,
  ...enAuth,
  ...enSettings,
  ...enAdmin,
  ...enAdminUser,
  ...enEditor,
  ...enEntityEditors,
  ...enUnits,
  ...enNutrients,
  ...enNutritionLabel,
};

export type MessageKey = keyof typeof en;

/** A complete set of translations. */
export type Messages = Record<MessageKey, string>;
