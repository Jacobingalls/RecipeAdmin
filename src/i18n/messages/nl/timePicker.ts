import type { enTimePicker } from '../en/timePicker';

export const nlTimePicker: Record<keyof typeof enTimePicker, string> = {
  'timePicker.block.lateNight': 'Late nacht',
  'timePicker.block.morning': 'Ochtend',
  'timePicker.block.midday': 'Middag',
  'timePicker.block.afternoon': 'Namiddag',
  'timePicker.block.evening': 'Avond',
  'timePicker.block.night': 'Nacht',

  'timePicker.now': 'Nu',
  'timePicker.today': 'Vandaag',
  'timePicker.yesterday': 'Gisteren',
  'timePicker.todayAt': 'Vandaag, {time}',
  'timePicker.yesterdayAt': 'Gisteren, {time}',
  'timePicker.dateAt': '{date}, {time}',

  'timePicker.preset.minutesAgo': '{count} min geleden',
  'timePicker.preset.hoursAgo': '{count} uur geleden',

  'timePicker.when': 'Wanneer',
  'timePicker.custom': 'Kies een specifieke datum en tijd…',
  'timePicker.customTitle': 'Aangepast',
  'timePicker.customLabel': 'Kies een specifieke datum en tijd',
  'timePicker.selectTime': 'Tijd kiezen',

  'timePicker.noPreviousBlock': 'Geen vorig dagdeel',
  'timePicker.noNextBlock': 'Geen volgend dagdeel',
  'timePicker.previousBlock': 'Vorige: {label}',
  'timePicker.nextBlock': 'Volgende: {label}',
  'timePicker.yesterdayNight': 'Gisteren, Nacht',
  'timePicker.todayLateNight': 'Vandaag, Late nacht',
};
