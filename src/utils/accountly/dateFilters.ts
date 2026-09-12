export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';
export type TypeFilter = 'all' | 'debit' | 'credit';

export interface AppliedFilters {
  datePreset: DatePreset;
  customStart: string;
  customEnd: string;
  type: TypeFilter;
}

export const DEFAULT_FILTERS: AppliedFilters = {
  datePreset: 'all',
  customStart: '',
  customEnd: '',
  type: 'all'
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const getDateRangeForPreset = (
  preset: DatePreset,
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date } | null => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'week': {
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case 'custom': {
      if (!customStart || !customEnd) return null;
      return { start: startOfDay(new Date(customStart)), end: endOfDay(new Date(customEnd)) };
    }
    case 'all':
    default:
      return null;
  }
};
