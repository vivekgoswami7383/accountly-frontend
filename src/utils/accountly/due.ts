export const toDateInputValue = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const todayStr = () => toDateInputValue(new Date());

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
};

export const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return toDateInputValue(d);
};

export const daysBetween = (fromStr: string, toStr: string): number => {
  const from = new Date(`${fromStr}T00:00:00Z`).getTime();
  const to = new Date(`${toStr}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86400000);
};

export type DueState = 'overdue' | 'today' | 'upcoming';

export const dueState = (dueDate: string, today: string = todayStr()): DueState => {
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'upcoming';
};

export const formatDueDate = (dueDate: string): string => {
  const d = new Date(`${dueDate}T12:00:00`);
  if (isNaN(d.getTime())) return dueDate;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
