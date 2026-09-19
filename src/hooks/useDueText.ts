import { useCallback } from 'react';
import { useT } from 'i18n/accountly';
import { daysBetween, dueState, todayStr } from 'utils/accountly/due';

const useDueText = () => {
  const t = useT();
  return useCallback(
    (dueDate: string) => {
      const today = todayStr();
      const state = dueState(dueDate, today);
      const days = daysBetween(today, dueDate);
      if (state === 'overdue') return t('due.overdueBy', { days: Math.abs(days) });
      if (state === 'today') return t('due.today');
      if (days === 1) return t('due.tomorrowLabel');
      return t('due.inDays', { days });
    },
    [t]
  );
};

export default useDueText;
