import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useT } from 'i18n/accountly';
import { datePresets, hasTimeLeftOn } from 'utils/accountly/reminders';
import { Pill } from './kit';
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
}) => {
  const t = useT();

  return (
    <PickerDialog open={open} onClose={onClose}>
      <Stack sx={{ width: '100%' }}>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', px: 2 }}>
          {datePresets().map((preset) => (
            <Pill key={preset.key} onClick={() => onConfirm(preset.day)}>
              {t(`reminders.preset.${preset.key}`)}
            </Pill>
          ))}
        </Stack>
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
      </Stack>
    </PickerDialog>
  );
};

export default ReminderDatePicker;
