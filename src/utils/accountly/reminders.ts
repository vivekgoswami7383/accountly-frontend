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

export const quickTimes = (now = new Date()) => {
  const inAnHour = new Date(Math.ceil((now.getTime() + 60 * 60000) / 60000) * 60000);
  const evening = atTime(now, 20);
  const tomorrow = atTime(new Date(now.getTime() + DAY_MS), 9);
  return [
    { key: 'inAnHour', at: inAnHour },
    ...(evening.getTime() - now.getTime() > 30 * 60000 ? [{ key: 'thisEvening', at: evening }] : []),
    { key: 'tomorrowMorning', at: tomorrow }
  ];
};

export const defaultReminderTime = (now = new Date()) => quickTimes(now)[0].at;

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
