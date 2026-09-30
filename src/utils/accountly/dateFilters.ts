import { ExpenseCategory } from 'services/accountly/types';

export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth' | 'all' | 'custom';
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

export type ExpenseCategoryFilter = 'all' | ExpenseCategory;

export interface ExpenseAppliedFilters {
  datePreset: DatePreset;
  customStart: string;
  customEnd: string;
  category: ExpenseCategoryFilter;
}

export const DEFAULT_EXPENSE_FILTERS: ExpenseAppliedFilters = {
  datePreset: 'all',
  customStart: '',
  customEnd: '',
  category: 'all'
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
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: startOfDay(start), end: endOfDay(end) };
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

export type ComparisonPeriod = 'yesterday' | 'dayBefore' | 'lastWeek' | 'lastMonth' | 'monthBefore' | 'previousDays';

export const getComparisonRange = (
  preset: DatePreset,
  range: { start: Date; end: Date }
): { start: Date; end: Date; period: ComparisonPeriod; days: number } => {
  const shiftDays = (d: Date, days: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() - days);
    return x;
  };
  const days = Math.round((startOfDay(range.end).getTime() - startOfDay(range.start).getTime()) / 86400000) + 1;

  switch (preset) {
    case 'today':
      return { start: shiftDays(range.start, 1), end: shiftDays(range.end, 1), period: 'yesterday', days };
    case 'yesterday':
      return { start: shiftDays(range.start, 1), end: shiftDays(range.end, 1), period: 'dayBefore', days };
    case 'week':
      return { start: shiftDays(range.start, 7), end: shiftDays(range.end, 7), period: 'lastWeek', days };
    case 'month': {
      const start = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
      const lastDay = new Date(range.start.getFullYear(), range.start.getMonth(), 0).getDate();
      const end = endOfDay(new Date(start.getFullYear(), start.getMonth(), Math.min(range.end.getDate(), lastDay)));
      return { start, end, period: 'lastMonth', days };
    }
    case 'lastMonth': {
      const start = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
      const end = endOfDay(new Date(range.start.getFullYear(), range.start.getMonth(), 0));
      return { start, end, period: 'monthBefore', days };
    }
    default:
      return { start: shiftDays(range.start, days), end: shiftDays(range.end, days), period: 'previousDays', days };
  }
};
