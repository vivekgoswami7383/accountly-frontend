import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Calendar } from 'lucide-react';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { addDays, addMonths, formatDueDate, todayStr } from 'utils/accountly/due';

const DueDateField = ({
  value,
  onChange,
  accent,
  label = true
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  accent?: string;
  label?: boolean;
}) => {
  const c = useAccountlyColors();
  const t = useT();
  const active = accent || c.red;
  const today = todayStr();

  const presets = useMemo(
    () => [
      { key: 'tomorrow', text: t('due.tomorrow'), date: addDays(today, 1) },
      { key: 'week', text: t('due.week'), date: addDays(today, 7) },
      { key: 'fortnight', text: t('due.fortnight'), date: addDays(today, 15) },
      { key: 'month', text: t('due.month'), date: addMonths(today, 1) }
    ],
    [t, today]
  );

  const presetMatch = presets.find((p) => p.date === value);
  const customSelected = Boolean(value) && !presetMatch;

  const chipSx = (selected: boolean) => ({
    position: 'relative' as const,
    flexShrink: 0,
    border: selected ? 'none' : `1.5px solid ${c.border}`,
    bgcolor: selected ? active : c.surface,
    color: selected ? '#fff' : c.ink,
    fontWeight: 500,
    fontSize: 13,
    px: 1.75,
    py: 0.75,
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: DISPLAY,
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75
  });

  return (
    <Box>
      {label && (
        <Typography sx={{ color: c.grey, fontSize: 12.5, fontWeight: 500, mb: 1 }}>{t('due.optional')}</Typography>
      )}
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {presets.map((p) => (
          <Box key={p.key} component="button" type="button" onClick={() => onChange(p.date === value ? null : p.date)} sx={chipSx(p.date === value)}>
            {p.text}
          </Box>
        ))}
        <Box component="label" sx={chipSx(customSelected)}>
          <Calendar size={14} />
          {customSelected && value ? formatDueDate(value) : t('due.pick')}
          <Box
            component="input"
            type="date"
            value={customSelected && value ? value : ''}
            min={addDays(today, 1)}
            onChange={(e: any) => onChange(e.target.value || null)}
            sx={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default DueDateField;
