import { useCallback } from 'react';
import { Box } from '@mui/material';
import { CalendarClock } from 'lucide-react';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { daysBetween, dueState, todayStr } from 'utils/accountly/due';

export const useDueText = () => {
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

const DueBadge = ({ dueDate, size = 'sm' }: { dueDate: string; size?: 'sm' | 'md' }) => {
  const c = useAccountlyColors();
  const text = useDueText();
  const state = dueState(dueDate);
  const overdue = state === 'overdue';
  const bg = overdue ? c.redSoft : c.chipGrey;
  const fg = overdue ? c.redDeep : state === 'today' ? c.ink : c.grey;
  const iconSize = size === 'md' ? 14 : 11;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: size === 'md' ? 1.25 : 0.875,
        py: size === 'md' ? 0.5 : 0.25,
        borderRadius: '999px',
        bgcolor: bg,
        color: fg,
        fontFamily: DISPLAY,
        fontWeight: 500,
        fontSize: size === 'md' ? 12.5 : 11,
        whiteSpace: 'nowrap',
        maxWidth: '100%'
      }}
    >
      <CalendarClock size={iconSize} style={{ flexShrink: 0 }} />
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {text(dueDate)}
      </Box>
    </Box>
  );
};

export default DueBadge;
