import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Stack } from '@mui/material';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { earliestMinuteOn, fromMinutes, toMinutes } from 'utils/accountly/reminders';
import PickerDialog from './PickerDialog';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;

type Period = (typeof PERIODS)[number];

const hour24 = (hour: number, period: Period) => (hour % 12) + (period === 'PM' ? 12 : 0);

function Column<T extends string | number>({
  items,
  selected,
  isDisabled,
  onSelect,
  format
}: {
  items: readonly T[];
  selected: T;
  isDisabled: (item: T) => boolean;
  onSelect: (item: T) => void;
  format: (item: T) => string;
}) {
  const c = useAccountlyColors();
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    const active = container?.querySelector<HTMLElement>('[data-active="true"]');
    if (!container || !active) return;
    container.scrollTo({ top: active.offsetTop - (container.clientHeight - ITEM_HEIGHT) / 2, behavior: 'smooth' });
  }, [selected]);

  return (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        overflowY: 'auto',
        position: 'relative',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      <Box sx={{ height: ITEM_HEIGHT * 2 }} />
      {items.map((item) => {
        const active = item === selected;
        const disabled = isDisabled(item);
        return (
          <ButtonBase
            key={item}
            data-active={active}
            disabled={disabled}
            onClick={() => onSelect(item)}
            sx={{
              width: '100%',
              height: ITEM_HEIGHT,
              borderRadius: '12px',
              fontFamily: DISPLAY,
              fontSize: 17,
              fontWeight: active ? 600 : 500,
              color: active ? '#fff' : disabled ? c.greyIcon : c.ink,
              bgcolor: active ? c.red : 'transparent',
              textDecoration: disabled ? 'line-through' : 'none'
            }}
          >
            {format(item)}
          </ButtonBase>
        );
      })}
      <Box sx={{ height: ITEM_HEIGHT * 2 }} />
    </Box>
  );
}

const ReminderTimePicker = ({
  open,
  day,
  value,
  onClose,
  onConfirm
}: {
  open: boolean;
  day: Date;
  value: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}) => {
  const [minutes, setMinutes] = useState(() => toMinutes(value));
  const earliest = earliestMinuteOn(day);

  useEffect(() => {
    if (open) setMinutes(Math.min(Math.max(toMinutes(value), earliest), 24 * 60 - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const h24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period: Period = h24 >= 12 ? 'PM' : 'AM';
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;

  const choose = (next: number) => setMinutes(Math.max(next, earliest));

  return (
    <PickerDialog open={open} onClose={onClose}>
      <Stack direction="row" spacing={1} sx={{ width: '100%', px: 1 }}>
        <Column
          items={HOURS}
          selected={hour}
          format={(item) => String(item)}
          isDisabled={(item) => hour24(item, period) * 60 + 59 < earliest}
          onSelect={(item) => choose(hour24(item, period) * 60 + minute)}
        />
        <Column
          items={MINUTES}
          selected={minute}
          format={(item) => String(item).padStart(2, '0')}
          isDisabled={(item) => h24 * 60 + item < earliest}
          onSelect={(item) => onConfirm(fromMinutes(Math.max(h24 * 60 + item, earliest)))}
        />
        <Column
          items={PERIODS}
          selected={period}
          format={(item) => item}
          isDisabled={(item) => item === 'AM' && 11 * 60 + 59 < earliest}
          onSelect={(item) => choose(hour24(hour, item) * 60 + minute)}
        />
      </Stack>
    </PickerDialog>
  );
};

export default ReminderTimePicker;
