import type { Translations } from '../../types';
import type { enTimePicker } from '../en/timePicker';

export const esTimePicker: Translations<typeof enTimePicker> = {
  'timePicker.block.lateNight': 'Madrugada',
  'timePicker.block.morning': 'Mañana',
  'timePicker.block.midday': 'Mediodía',
  'timePicker.block.afternoon': 'Tarde',
  'timePicker.block.evening': 'Noche',
  'timePicker.block.night': 'Noche cerrada',

  'timePicker.now': 'Ahora',
  'timePicker.today': 'Hoy',
  'timePicker.yesterday': 'Ayer',
  'timePicker.todayAt': 'Hoy, {{time}}',
  'timePicker.yesterdayAt': 'Ayer, {{time}}',
  'timePicker.dateAt': '{{date}}, {{time}}',

  'timePicker.preset.minutesAgo': 'hace {{amount}} min',
  'timePicker.preset.hoursAgo': 'hace {{amount}} h',

  'timePicker.when': 'Cuándo',
  'timePicker.custom': 'Elige una fecha y hora concretas…',
  'timePicker.customTitle': 'Personalizado',
  'timePicker.customLabel': 'Elige una fecha y hora concretas',
  'timePicker.selectTime': 'Selecciona la hora',

  'timePicker.noPreviousBlock': 'No hay franja anterior',
  'timePicker.noNextBlock': 'No hay franja siguiente',
  'timePicker.previousBlock': 'Anterior: {{label}}',
  'timePicker.nextBlock': 'Siguiente: {{label}}',
  'timePicker.yesterdayNight': 'Ayer, noche cerrada',
  'timePicker.todayLateNight': 'Hoy, madrugada',
};
