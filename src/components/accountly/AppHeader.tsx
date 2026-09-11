import { ReactNode, MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Container, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Store, ArrowLeft, User, Settings, LogOut } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const c = useAccountlyColors();
  const t = useT();
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);

  const doLogout = async () => {
    setMenuEl(null);
    await logout();
    navigate('/login', { state: { from: '' } });
  };

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
                <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, lineHeight: 1.15, color: c.ink }} noWrap>
                  {user?.business?.business_name || 'My Business'}
                </Typography>
                <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }} noWrap>
                  {roleLabel} · {t('header.manageKhata')}
                </Typography>
              </Box>
              <IconButton onClick={(e: MouseEvent<HTMLElement>) => setMenuEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: c.redDeep, fontFamily: DISPLAY, fontWeight: 700, fontSize: 15 }}>
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
              <Menu
                anchorEl={menuEl}
                open={Boolean(menuEl)}
                onClose={() => setMenuEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 220, py: 0.5 } }}
              >
                <MenuItem onClick={() => { setMenuEl(null); navigate('/profile'); }} sx={{ gap: 1.5, py: 1.25 }}>
                  <User size={18} /> {t('menu.profile')}
                </MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); navigate('/settings'); }} sx={{ gap: 1.5, py: 1.25 }}>
                  <Settings size={18} /> {t('menu.settings')}
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={doLogout} sx={{ color: c.red, gap: 1.5, py: 1.25 }}>
                  <LogOut size={18} /> {t('menu.logout')}
                </MenuItem>
              </Menu>
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
                  sx={{ flex: 1, fontFamily: DISPLAY, fontWeight: 700, fontSize: variant === 'root' ? 19 : 17, color: c.ink }}
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
