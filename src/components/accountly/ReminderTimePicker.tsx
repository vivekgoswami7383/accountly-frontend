import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { defaultReminderTime, toTimeInputValue, withTime } from 'utils/accountly/reminders';

const ReminderTimePicker = ({
  open,
  value,
  onClose,
  onConfirm
}: {
  open: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}) => {
  const t = useT();
  const c = useAccountlyColors();
  const [day, setDay] = useState<Date>(value);
  const [time, setTime] = useState(toTimeInputValue(value));
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = value.getTime() > Date.now() ? value : defaultReminderTime();
    setDay(start);
    setTime(toTimeInputValue(start));
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const picked = withTime(day, time);
  const inPast = picked.getTime() <= Date.now();

  const confirm = () => {
    if (inPast) {
      setTried(true);
      return;
    }
    onConfirm(picked);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: DISPLAY, fontSize: '1.05rem', pb: 0 }}>{t('reminders.pickTime')}</DialogTitle>
      <DialogContent sx={{ px: 1, pb: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar value={day} onChange={(next) => next && setDay(next)} disablePast />
        </LocalizationProvider>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2 }}>
          <Typography sx={{ flex: 1, fontWeight: 500, fontSize: 14, color: c.ink }}>{t('reminders.time')}</Typography>
          <TextField
            type="time"
            value={time}
            onChange={(e) => e.target.value && setTime(e.target.value)}
            inputProps={{ step: 60, 'aria-label': t('reminders.time') }}
            sx={{ width: 150 }}
          />
        </Stack>
        {inPast && (
          <Typography sx={{ color: c.redDeep, fontSize: tried ? 13.5 : 12.5, fontWeight: tried ? 600 : 500, px: 2, pt: 1 }}>
            {t('reminders.timeInPast')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, pt: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={confirm}>
          {t('reminders.setTime')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderTimePicker;
