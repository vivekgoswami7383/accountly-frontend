import { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Users, Receipt, Wallet, NotebookPen, BarChart3, CalendarClock } from 'lucide-react';
import { AVATAR_TINTS_LIGHT, AVATAR_TINTS_DARK, useAccountlyColors, useAccountlyMode } from 'themes/accountly';

const BLOB_PATH = 'M50,8 C68,6 92,22 92,48 C92,74 70,94 46,92 C22,90 6,70 8,46 C10,22 32,10 50,8 Z';

interface EmptyIllustrationProps {
  icon: ReactNode;
  bg: string;
  fg: string;
  size?: number;
}

export const EmptyIllustration = ({ icon, bg, fg, size = 96 }: EmptyIllustrationProps) => (
  <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
    <Box component="svg" viewBox="0 0 100 100" sx={{ position: 'absolute', inset: 0, width: size, height: size }}>
      <path d={BLOB_PATH} fill={bg} />
    </Box>
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        color: fg,
        '& svg': { width: size * 0.4, height: size * 0.4 }
      }}
    >
      {icon}
    </Box>
  </Box>
);

const useTint = (index: number) => {
  const mode = useAccountlyMode();
  return (mode === 'dark' ? AVATAR_TINTS_DARK : AVATAR_TINTS_LIGHT)[index];
};

export const ContactsEmptyIllustration = ({ size }: { size?: number }) => {
  const tint = useTint(1);
  return <EmptyIllustration icon={<Users strokeWidth={1.75} />} bg={tint.bg} fg={tint.fg} size={size} />;
};

export const TransactionsEmptyIllustration = ({ size }: { size?: number }) => {
  const tint = useTint(5);
  return <EmptyIllustration icon={<Receipt strokeWidth={1.75} />} bg={tint.bg} fg={tint.fg} size={size} />;
};

export const ExpensesEmptyIllustration = ({ size }: { size?: number }) => {
  const c = useAccountlyColors();
  return <EmptyIllustration icon={<Wallet strokeWidth={1.75} />} bg={c.redSoft} fg={c.redDeep} size={size} />;
};

export const NotesEmptyIllustration = ({ size }: { size?: number }) => {
  const tint = useTint(4);
  return <EmptyIllustration icon={<NotebookPen strokeWidth={1.75} />} bg={tint.bg} fg={tint.fg} size={size} />;
};

export const ReportsEmptyIllustration = ({ size }: { size?: number }) => {
  const tint = useTint(0);
  return <EmptyIllustration icon={<BarChart3 strokeWidth={1.75} />} bg={tint.bg} fg={tint.fg} size={size} />;
};

export const DueEmptyIllustration = ({ size }: { size?: number }) => {
  const tint = useTint(2);
  return <EmptyIllustration icon={<CalendarClock strokeWidth={1.75} />} bg={tint.bg} fg={tint.fg} size={size} />;
};
