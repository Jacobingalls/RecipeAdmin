import type { Translations } from '../../types';
import type { enTimePicker } from '../en/timePicker';

export const daTimePicker: Translations<typeof enTimePicker> = {
  'timePicker.block.lateNight': 'Sen nat',
  'timePicker.block.morning': 'Morgen',
  'timePicker.block.midday': 'Middag',
  'timePicker.block.afternoon': 'Eftermiddag',
  'timePicker.block.evening': 'Aften',
  'timePicker.block.night': 'Nat',

  'timePicker.now': 'Nu',
  'timePicker.today': 'I dag',
  'timePicker.yesterday': 'I går',
  'timePicker.todayAt': 'I dag, {{time}}',
  'timePicker.yesterdayAt': 'I går, {{time}}',
  'timePicker.dateAt': '{{date}}, {{time}}',

  'timePicker.preset.minutesAgo': 'for {{amount}} min siden',
  'timePicker.preset.hoursAgo': 'for {{amount}} t siden',

  'timePicker.when': 'Hvornår',
  'timePicker.custom': 'Vælg en bestemt dato og tid…',
  'timePicker.customTitle': 'Tilpasset',
  'timePicker.customLabel': 'Vælg en bestemt dato og tid',
  'timePicker.selectTime': 'Vælg tidspunkt',

  'timePicker.noPreviousBlock': 'Ingen forrige blok',
  'timePicker.noNextBlock': 'Ingen næste blok',
  'timePicker.previousBlock': 'Forrige: {{label}}',
  'timePicker.nextBlock': 'Næste: {{label}}',
  'timePicker.yesterdayNight': 'I går, nat',
  'timePicker.todayLateNight': 'I dag, sen nat',
};
