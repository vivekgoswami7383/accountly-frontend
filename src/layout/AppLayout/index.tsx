import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Container, CssBaseline, Stack, ThemeProvider, Typography } from '@mui/material';
import { Home, Users, ArrowRightLeft, LayoutGrid } from 'lucide-react';
import accountlyTheme, { c, shadow } from 'themes/accountly';

const TABS = [
  { label: 'Home', icon: <Home size={21} />, to: '/' },
  { label: 'Customers', icon: <Users size={21} />, to: '/customer' },
  { label: 'Payments', icon: <ArrowRightLeft size={21} />, to: '/transaction' },
  { label: 'More', icon: <LayoutGrid size={21} />, to: '/more' }
];

const isTabRoute = (p: string) => TABS.some((t) => t.to === p);
const activeTab = (p: string) => {
  let idx = 0;
  TABS.forEach((t, i) => {
    if (t.to === '/' ? p === '/' : p.startsWith(t.to)) idx = i;
  });
  return idx;
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showNav = isTabRoute(location.pathname);

  return (
    <ThemeProvider theme={accountlyTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: c.bg, color: c.ink }}>
        <Box
          sx={{
            minHeight: '100vh',
            pb: showNav ? `calc(96px + env(safe-area-inset-bottom, 0px))` : `calc(24px + env(safe-area-inset-bottom, 0px))`
          }}
        >
          <Outlet />
        </Box>

        {showNav && (
          <Box
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 30,
              px: 1.5,
              pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
              pointerEvents: 'none'
            }}
          >
            <Container maxWidth="sm" disableGutters>
              <Box sx={{ pointerEvents: 'auto', bgcolor: c.surface, borderRadius: '26px', boxShadow: shadow.nav, overflow: 'hidden' }}>
                <Stack direction="row" sx={{ height: 62 }}>
                  {TABS.map((t, i) => {
                    const active = activeTab(location.pathname) === i;
                    return (
                      <ButtonBase
                        key={t.label}
                        onClick={() => navigate(t.to)}
                        sx={{ flex: 1, flexDirection: 'column', gap: 0.375, position: 'relative', color: active ? c.red : c.greyLight }}
                      >
                        {active && <Box sx={{ position: 'absolute', top: 0, width: 26, height: 3, borderRadius: 3, bgcolor: c.red }} />}
                        <Box sx={{ display: 'grid', placeItems: 'center' }}>{t.icon}</Box>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>{t.label}</Typography>
                      </ButtonBase>
                    );
                  })}
                </Stack>
              </Box>
            </Container>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;
