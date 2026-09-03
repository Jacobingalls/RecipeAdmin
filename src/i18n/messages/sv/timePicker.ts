import type { Translations } from '../../types';
import type { enTimePicker } from '../en/timePicker';

export const svTimePicker: Translations<typeof enTimePicker> = {
  'timePicker.block.lateNight': 'Sen natt',
  'timePicker.block.morning': 'Morgon',
  'timePicker.block.midday': 'Mitt på dagen',
  'timePicker.block.afternoon': 'Eftermiddag',
  'timePicker.block.evening': 'Kväll',
  'timePicker.block.night': 'Natt',

  'timePicker.now': 'Nu',
  'timePicker.today': 'I dag',
  'timePicker.yesterday': 'I går',
  'timePicker.todayAt': 'I dag, {{time}}',
  'timePicker.yesterdayAt': 'I går, {{time}}',
  'timePicker.dateAt': '{{date}}, {{time}}',

  'timePicker.preset.minutesAgo': 'för {{amount}} min sedan',
  'timePicker.preset.hoursAgo': 'för {{amount}} tim sedan',

  'timePicker.when': 'När',
  'timePicker.custom': 'Välj ett datum och en tid…',
  'timePicker.customTitle': 'Eget val',
  'timePicker.customLabel': 'Välj ett datum och en tid',
  'timePicker.selectTime': 'Välj tid',

  'timePicker.noPreviousBlock': 'Inget föregående block',
  'timePicker.noNextBlock': 'Inget nästa block',
  'timePicker.previousBlock': 'Föregående: {{label}}',
  'timePicker.nextBlock': 'Nästa: {{label}}',
  'timePicker.yesterdayNight': 'I går, natt',
  'timePicker.todayLateNight': 'I dag, sen natt',
};
