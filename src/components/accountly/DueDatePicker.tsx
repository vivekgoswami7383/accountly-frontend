import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { toDateInputValue } from 'utils/accountly/due';
import PickerDialog from './PickerDialog';

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
}) => (
  <PickerDialog open={open} onClose={onClose}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar
        value={toDate(value)}
        onChange={(next, selection) => {
          if (next && selection === 'finish') onConfirm(toDateInputValue(next));
        }}
        disablePast
      />
    </LocalizationProvider>
  </PickerDialog>
);

export default DueDatePicker;
