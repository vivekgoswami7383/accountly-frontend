import { Box, Stack } from '@mui/material';
import { CONTACT_TYPES, ContactType } from 'services/accountly/types';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';

const ContactTypeChips = ({
  value,
  onChange,
  withAll = false,
  scroll = false
}: {
  value: ContactType | null;
  onChange: (next: ContactType | null) => void;
  withAll?: boolean;
  scroll?: boolean;
}) => {
  const c = useAccountlyColors();
  const t = useT();
  const options: (ContactType | null)[] = withAll ? [null, ...CONTACT_TYPES] : CONTACT_TYPES;

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
            {option ? t(`contactType.${option}`) : t('contactType.all')}
          </Box>
        );
      })}
    </Stack>
  );
};

export default ContactTypeChips;
