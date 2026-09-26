import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useT } from 'i18n/accountly';
import { hasTimeLeftOn } from 'utils/accountly/reminders';

const ReminderDatePicker = ({
  open,
  value,
  onClose,
  onConfirm
}: {
  open: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (day: Date) => void;
}) => {
  const t = useT();
  const [day, setDay] = useState<Date>(value);

  useEffect(() => {
    if (open) setDay(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ px: 1, pb: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={day}
            onChange={(next) => next && setDay(next)}
            disablePast
            shouldDisableDate={(date) => !hasTimeLeftOn(date)}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={() => onConfirm(day)}>
          {t('reminders.setDate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderDatePicker;
