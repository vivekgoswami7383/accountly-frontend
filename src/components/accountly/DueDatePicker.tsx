import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useT } from 'i18n/accountly';
import { toDateInputValue } from 'utils/accountly/due';

const toDate = (value: string | null) => (value ? new Date(`${value}T12:00:00`) : null);

const DueDatePicker = ({
  open,
  value,
  onClose,
  onConfirm
}: {
  open: boolean;
  value: string | null;
  onClose: () => void;
  onConfirm: (date: string) => void;
}) => {
  const t = useT();
  const [draft, setDraft] = useState<Date | null>(toDate(value));

  useEffect(() => {
    if (open) setDraft(toDate(value));
  }, [open, value]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ px: 1, pb: 0, display: 'flex', justifyContent: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar value={draft} onChange={(next) => setDraft(next)} disablePast />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('common.cancel')}
        </Button>
        <Button variant="contained" disabled={!draft} onClick={() => draft && onConfirm(toDateInputValue(draft))}>
          {t('due.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DueDatePicker;
