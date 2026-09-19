import { Stack, Typography } from '@mui/material';
import { Link2 } from 'lucide-react';
import { useAccountlyColors } from 'themes/accountly';

const ContactNameLine = ({ name, linked, fontSize = 14.5, lineHeight }: { name: string; linked?: boolean; fontSize?: number; lineHeight?: number }) => {
  const c = useAccountlyColors();
  return (
    <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 500, fontSize, lineHeight, color: c.ink }} noWrap>
        {name}
      </Typography>
      {linked && <Link2 size={13} color={c.greenDeep} style={{ flexShrink: 0 }} />}
    </Stack>
  );
};

export default ContactNameLine;
