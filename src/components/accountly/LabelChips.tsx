import { Box, Stack } from '@mui/material';
import { CONTACT_LABELS, ContactLabel } from 'services/accountly/types';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';

const LabelChips = ({
  value,
  onChange,
  withAll = false,
  scroll = false
}: {
  value: ContactLabel | null;
  onChange: (next: ContactLabel | null) => void;
  withAll?: boolean;
  scroll?: boolean;
}) => {
  const c = useAccountlyColors();
  const t = useT();
  const options: (ContactLabel | null)[] = withAll ? [null, ...CONTACT_LABELS] : CONTACT_LABELS;

  return (
    <Stack
      direction="row"
      sx={{ gap: 1, flexWrap: scroll ? 'nowrap' : 'wrap', overflowX: scroll ? 'auto' : 'visible', pb: scroll ? 0.5 : 0, '&::-webkit-scrollbar': { display: 'none' } }}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <Box
            key={option || 'all'}
            component="button"
            type="button"
            onClick={() => onChange(!withAll && active ? null : option)}
            sx={{
              flexShrink: 0,
              border: active ? 'none' : `1.5px solid ${c.border}`,
              bgcolor: active ? c.red : c.surface,
              color: active ? '#fff' : c.ink,
              fontWeight: 500,
              fontSize: 13,
              px: 1.75,
              py: 0.75,
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: DISPLAY,
              whiteSpace: 'nowrap'
            }}
          >
            {option ? t(`label.${option}`) : t('label.all')}
          </Box>
        );
      })}
    </Stack>
  );
};

export default LabelChips;
