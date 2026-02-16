export interface Block {
  name: string;
  icon: string;
  iconColor: string;
  coreStart: number;
  coreEnd: number;
}

export const BLOCKS: Block[] = [
  { name: 'Late night', icon: 'bi-moon-stars', iconColor: '#6366f1', coreStart: 0, coreEnd: 300 },
  { name: 'Morning', icon: 'bi-sunrise', iconColor: '#f59e0b', coreStart: 300, coreEnd: 600 },
  { name: 'Midday', icon: 'bi-sun', iconColor: '#eab308', coreStart: 600, coreEnd: 840 },
  { name: 'Afternoon', icon: 'bi-cloud-sun', iconColor: '#f97316', coreStart: 840, coreEnd: 1020 },
  { name: 'Evening', icon: 'bi-sunset', iconColor: '#ef4444', coreStart: 1020, coreEnd: 1260 },
  { name: 'Night', icon: 'bi-moon', iconColor: '#8b5cf6', coreStart: 1260, coreEnd: 1440 },
];

export const BUFFER = 30;

export function blockSliderMin(idx: number): number {
  return BLOCKS[idx].coreStart - BUFFER;
}

export function blockSliderMax(idx: number): number {
  return BLOCKS[idx].coreEnd + BUFFER;
}

export function formatTime(totalMinutes: number): {
  display: string;
  period: string;
  full: string;
} {
  // Normalize to 0–1439 so negative or >1440 values display correctly
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const display = `${h12}:${m.toString().padStart(2, '0')}`;
  return { display, period, full: `${display} ${period}` };
}

export function blockForMinutes(minutes: number): number {
  for (let i = 0; i < BLOCKS.length; i++) {
    if (minutes < BLOCKS[i].coreEnd) return i;
  }
  return BLOCKS.length - 1;
}

export function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function epochToDayMinutes(epoch: number): {
  dayOffset: number;
  minutes: number;
} {
  const now = new Date();
  const date = new Date(epoch * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOffset = Math.round(
    (dateStart.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  const minutes = date.getHours() * 60 + date.getMinutes();
  return { dayOffset, minutes };
}

export function dayMinutesToEpoch(dayOffset: number, minutes: number): number {
  // Normalize minutes to 0–1439, adjusting dayOffset for overflow/underflow
  const adjustedDays = dayOffset + Math.floor(minutes / 1440);
  const adjustedMinutes = ((minutes % 1440) + 1440) % 1440;
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + adjustedDays);
  target.setHours(Math.floor(adjustedMinutes / 60), adjustedMinutes % 60, 0, 0);
  return Math.floor(target.getTime() / 1000);
}

export interface Tick {
  label: string;
  minutes: number;
}

export function tickPadding(idx: number): { left: number; right: number } {
  const sliderMin = blockSliderMin(idx);
  const sliderMax = blockSliderMax(idx);
  const totalRange = sliderMax - sliderMin;
  const left = ((BLOCKS[idx].coreStart - sliderMin) / totalRange) * 100;
  const right = ((sliderMax - BLOCKS[idx].coreEnd) / totalRange) * 100;
  return { left, right };
}

export function buildCoreTicks(block: Block): Tick[] {
  const ticks: Tick[] = [];
  const startHour = Math.ceil(block.coreStart / 60);
  const endHour = Math.floor(block.coreEnd / 60);
  for (let h = startHour; h <= endHour; h++) {
    const h24 = h % 24;
    const period = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    ticks.push({ label: `${h12} ${period}`, minutes: h * 60 });
  }
  return ticks;
}

export function formatBlockRange(block: Block): string {
  const start = formatTime(block.coreStart);
  const end = formatTime(block.coreEnd);
  const startH = start.display.split(':')[0];
  const endH = end.display.split(':')[0];
  if (start.period === end.period) {
    return `${startH} \u2013 ${endH} ${start.period}`;
  }
  return `${startH} ${start.period} \u2013 ${endH} ${end.period}`;
}

export function formatDayHint(dayOffset: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTriggerLabel(epoch: number): string {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - epoch) < 60) return 'Now';

  const { dayOffset, minutes } = epochToDayMinutes(epoch);
  const time = formatTime(minutes);
  if (dayOffset === 0) return `Today, ${time.full}`;
  if (dayOffset === -1) return `Yesterday, ${time.full}`;

  const date = new Date(epoch * 1000);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time.full}`;
}

export function epochToDatetimeLocal(epoch: number): string {
  const date = new Date(epoch * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function datetimeLocalToEpoch(value: string): number {
  return new Date(value).getTime() / 1000;
}

export type InitialView =
  | { level: 'root' }
  | { level: 'slider'; dayOffset: number; blockIdx: number; minutes: number }
  | { level: 'custom' };

export function determineInitialView(epoch: number): InitialView {
  const nowEpoch = Math.floor(Date.now() / 1000);
  const diffSec = nowEpoch - epoch;

  // Check preset matches (Now, 15m, 30m, 1hr, 2hr, 3hr)
  const presetMinutes = [0, 15, 30, 60, 120, 180];
  for (const mins of presetMinutes) {
    if (Math.abs(diffSec - mins * 60) < 60) return { level: 'root' };
  }

  const { dayOffset, minutes } = epochToDayMinutes(epoch);

  // Only today or yesterday can use the slider
  if (dayOffset === 0 || dayOffset === -1) {
    // Check if 5-minute aligned
    if (minutes % 5 === 0) {
      const blockIdx = blockForMinutes(minutes);
      return { level: 'slider', dayOffset, blockIdx, minutes };
    }
  }

  return { level: 'custom' };
}
