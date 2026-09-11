import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Divider, Stack, Typography } from '@mui/material';
import { User, Settings, BarChart3, LogOut, ChevronRight } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, ListRow, IconDot } from 'components/accountly/kit';

const More = () => {
  const navigate = useNavigate();
  const { user, business, logout } = useAuth();
  const c = useAccountlyColors();
  const t = useT();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { state: { from: '' } });
  };

  const items = [
    { label: t('menu.profile'), desc: t('more.profileDesc'), icon: <User />, path: '/profile' },
    { label: t('menu.settings'), desc: t('more.settingsDesc'), icon: <Settings />, path: '/settings' },
    { label: t('more.reports'), desc: t('more.reportsComingSoon'), icon: <BarChart3 />, path: '/reports' }
  ];

  return (
    <>
      <AppHeader variant="root" title={t('more.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2.5}>
          <AppCard sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: c.redDeep, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, flexShrink: 0 }}
            >
              {(user?.name || 'U')[0].toUpperCase()}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }} noWrap>
                {user?.name || 'User'}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, fontWeight: 500 }} noWrap>
                {t(`role.${user?.role || 'owner'}`)} · {business?.business_name || 'My Business'}
              </Typography>
            </Box>
          </AppCard>

          <AppCard sx={{ overflow: 'hidden' }}>
            {items.map((item, i) => (
              <Box key={item.path}>
                {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                <ListRow onClick={() => navigate(item.path)}>
                  <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                    {item.icon}
                  </IconDot>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: c.ink }}>{item.label}</Typography>
                    <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500 }}>{item.desc}</Typography>
                  </Box>
                  <ChevronRight size={16} color={c.greyIcon} />
                </ListRow>
              </Box>
            ))}
          </AppCard>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogOut size={18} />}
            onClick={handleLogout}
            sx={{ color: c.red, borderColor: c.border, bgcolor: c.surface, py: 1.5 }}
          >
            {t('menu.logout')}
          </Button>
        </Stack>
      </Container>
    </>
  );
};

export default More;
