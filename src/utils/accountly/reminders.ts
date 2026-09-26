import { formatTime } from './format';

const DAY_MS = 86400000;

export type ReminderGroup = 'today' | 'tomorrow' | 'later';

export const deviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const atTime = (d: Date, hours: number, minutes = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes);

export const dayOffset = (date: Date, now = new Date()) => Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS);

export const groupFor = (iso: string, now = new Date()): ReminderGroup => {
  const offset = dayOffset(new Date(iso), now);
  if (offset <= 0) return 'today';
  if (offset === 1) return 'tomorrow';
  return 'later';
};

const FIVE_MINUTES_MS = 5 * 60000;

export const defaultReminderTime = (now = new Date()) =>
  new Date(Math.ceil((now.getTime() + 60 * 60000) / FIVE_MINUTES_MS) * FIVE_MINUTES_MS);

export const dayLabel = (date: Date, t: (key: string) => string, now = new Date()) => {
  const offset = dayOffset(date, now);
  if (offset === 0) return t('reminders.today');
  if (offset === 1) return t('reminders.tomorrow');
  if (offset === -1) return t('reminders.yesterday');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {})
  });
};

export const formatWhen = (iso: string, t: (key: string) => string, now = new Date()) =>
  `${dayLabel(new Date(iso), t, now)}, ${formatTime(iso)}`;

export const toTimeInputValue = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export const withTime = (day: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return atTime(day, hours || 0, minutes || 0);
};

const MINUTES_PER_DAY = 24 * 60;

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const fromMinutes = (total: number) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

export const earliestMinuteOn = (day: Date, now = new Date()) => {
  const offset = dayOffset(day, now);
  if (offset > 0) return 0;
  if (offset < 0) return MINUTES_PER_DAY;
  return now.getHours() * 60 + now.getMinutes() + 1;
};

export const hasTimeLeftOn = (day: Date, now = new Date()) => earliestMinuteOn(day, now) < MINUTES_PER_DAY;

const daysUntil = (weekday: number, now: Date) => (weekday - now.getDay() + 7) % 7 || 7;

export const datePresets = (now = new Date()) =>
  [
    { key: 'today', day: now },
    { key: 'tomorrow', day: new Date(now.getTime() + DAY_MS) },
    { key: 'nextWeekend', day: new Date(now.getTime() + daysUntil(6, now) * DAY_MS) },
    { key: 'nextWeek', day: new Date(now.getTime() + daysUntil(1, now) * DAY_MS) }
  ].filter((preset) => hasTimeLeftOn(preset.day, now));
