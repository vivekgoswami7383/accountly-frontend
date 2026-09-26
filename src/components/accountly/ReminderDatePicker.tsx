import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { hasTimeLeftOn } from 'utils/accountly/reminders';
import PickerDialog from './PickerDialog';

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
}) => (
  <PickerDialog open={open} onClose={onClose}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar
        value={value}
        onChange={(next, selection) => {
          if (next && selection === 'finish') onConfirm(next);
        }}
        disablePast
        shouldDisableDate={(date) => !hasTimeLeftOn(date)}
      />
    </LocalizationProvider>
  </PickerDialog>
);

export default ReminderDatePicker;
