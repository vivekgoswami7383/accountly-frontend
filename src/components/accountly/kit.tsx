import { ComponentProps, ReactNode, forwardRef } from 'react';
import { Box, ButtonBase, Container, Stack, Typography, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { shadow, DISPLAY, useAccountlyColors } from 'themes/accountly';

export const FOOTER_SPACE = 'calc(72px + env(safe-area-inset-bottom, 0px))';

export const BottomActionBar = ({ children }: { children: ReactNode }) => {
  const c = useAccountlyColors();
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 25,
        bgcolor: alpha(c.surface, 0.55),
        backdropFilter: 'blur(22px) saturate(180%)',
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translate3d(0,0,0)',
        willChange: 'backdrop-filter',
        borderTop: `1px solid ${c.line}`,
        boxShadow: '0 -8px 24px -12px rgba(20,23,26,0.12)',
        pt: 1.5,
        pb: 'calc(14px + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2.25 }}>
        {children}
      </Container>
    </Box>
  );
};

export const AppCard = styled(Box)(({ theme }) => ({
  background: (theme as any).accountly.surface,
  borderRadius: 24,
  boxShadow: shadow.card,
  color: (theme as any).accountly.ink
}));

const StyledListRow = styled(ButtonBase)(({ theme }) => {
  const c = (theme as any).accountly;
  return {
    width: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 12,
    padding: '15px 16px',
    textAlign: 'left',
    color: c.ink,
    transition: 'background-color .15s ease',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    '@media (hover: hover) and (pointer: fine)': {
      '&:hover': { backgroundColor: alpha(c.ink, 0.04) }
    },
    '&:active': { backgroundColor: alpha(c.ink, 0.08) }
  };
});

export const ListRow = forwardRef<HTMLButtonElement, ComponentProps<typeof StyledListRow>>((props, ref) => (
  <StyledListRow ref={ref} disableRipple disableTouchRipple {...props} />
));

export const BalanceTag = styled(Box)<{ tone: 'get' | 'give' }>(({ theme, tone }) => {
  const c = (theme as any).accountly;
  return {
    alignSelf: 'flex-start',
    padding: '2px 7px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.04em',
    lineHeight: 1.6,
    color: tone === 'get' ? c.greenDeep : c.redDeep,
    background: tone === 'get' ? c.greenSoft : c.redSoft
  };
});

export const IconDot = ({
  children,
  bg,
  fg,
  size = 44,
  icon
}: {
  children: ReactNode;
  bg: string;
  fg: string;
  size?: number;
  icon?: number;
}) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      bgcolor: bg,
      color: fg,
      flexShrink: 0,
      '& svg': { width: icon ?? Math.round(size * 0.44), height: icon ?? Math.round(size * 0.44) }
    }}
  >
    {children}
  </Box>
);

export const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => {
  const c = useAccountlyColors();
  return (
    <Stack direction="row" alignItems="center" sx={{ px: 0.25, mb: 1.25 }}>
      <Typography sx={{ flex: 1, fontFamily: DISPLAY, fontWeight: 500, fontSize: 18, color: c.ink, letterSpacing: '-0.01em' }}>{title}</Typography>
      {action && (
        <ButtonBase onClick={onAction} sx={{ borderRadius: 1.5, px: 0.5, py: 0.25, color: c.slate }}>
          <Typography sx={{ color: c.slate, fontWeight: 500, fontSize: 12.5, mr: 0.375 }}>{action}</Typography>
          <ChevronRight size={14} />
        </ButtonBase>
      )}
    </Stack>
  );
};

export const Fade = ({ children, delay = 0, skipEnter = false }: { children: ReactNode; delay?: number; skipEnter?: boolean }) => (
  <motion.div initial={skipEnter ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

export const MotionButton = motion(ButtonBase);
