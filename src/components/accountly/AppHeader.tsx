import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Container, IconButton, Stack, Typography } from '@mui/material';
import { Store, ArrowLeft } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { IconDot } from './kit';

interface AppHeaderProps {
  variant?: 'home' | 'screen' | 'root';
  title?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
}

const AppHeader = ({ variant = 'screen', title, onBack, right }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, business } = useAuth();
  const c = useAccountlyColors();
  const t = useT();

  const roleLabel = t(`role.${user?.role || 'owner'}`);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        bgcolor: c.surface,
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 1px 0 rgba(20,23,26,0.03)'
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2.5 }}>
        <Stack direction="row" alignItems="center" sx={{ height: 66, gap: 1.5 }}>
          {variant === 'home' ? (
            <>
              <IconDot size={38} bg={c.redSoft} fg={c.red}>
                <Store />
              </IconDot>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16, lineHeight: 1.15, color: c.ink }} noWrap>
                  {business?.business_name || 'My Business'}
                </Typography>
                <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }} noWrap>
                  {roleLabel} · {t('header.manageKhata')}
                </Typography>
              </Box>
              <IconButton onClick={() => navigate('/more')} sx={{ p: 0.5 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user?.avatar_url || undefined}
                    sx={{ width: 38, height: 38, bgcolor: c.redDeep, fontFamily: DISPLAY, fontWeight: 500, fontSize: 15 }}
                  >
                    {(user?.name || 'U')[0].toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -1,
                      bottom: -1,
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      bgcolor: c.onlineDot,
                      border: `2px solid ${c.surface}`
                    }}
                  />
                </Box>
              </IconButton>
            </>
          ) : (
            <>
              {variant === 'screen' && (
                <IconButton onClick={onBack || (() => navigate(-1))} sx={{ ml: -1, color: c.ink }} aria-label="back">
                  <ArrowLeft size={20} />
                </IconButton>
              )}
              {typeof title === 'string' ? (
                <Typography
                  sx={{ flex: 1, fontFamily: DISPLAY, fontWeight: 500, fontSize: variant === 'root' ? 19 : 17, color: c.ink }}
                  noWrap
                >
                  {title}
                </Typography>
              ) : (
                <Box sx={{ flex: 1, minWidth: 0 }}>{title}</Box>
              )}
              {right}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default AppHeader;
