import { useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Container, CssBaseline, Stack, ThemeProvider, Typography } from '@mui/material';
import { Home, Users, ArrowRightLeft, LayoutGrid } from 'lucide-react';
import { createAccountlyTheme, getAccountlyColors, shadow } from 'themes/accountly';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { useT } from 'i18n/accountly';
import { ThemeMode, I18n } from 'types/config';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, onChangeMode, onChangeLocalization, onChangeCurrency } = useConfig();
  const { user, business } = useAuth();
  const t = useT();

  const syncedRef = useRef(false);
  useEffect(() => {
    if (syncedRef.current || !user) return;
    syncedRef.current = true;
    if (user.theme) onChangeMode(user.theme === 'dark' ? ThemeMode.DARK : ThemeMode.LIGHT);
    if (user.language) onChangeLocalization(user.language as I18n);
    if (business?.currency) onChangeCurrency(business.currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, business]);
  const accountlyMode = mode === ThemeMode.DARK ? 'dark' : 'light';
  const theme = useMemo(() => createAccountlyTheme(accountlyMode), [accountlyMode]);
  const c = getAccountlyColors(accountlyMode);

  const TABS = [
    { label: t('nav.home'), icon: <Home size={21} />, to: '/' },
    { label: t('nav.customers'), icon: <Users size={21} />, to: '/customer' },
    { label: t('nav.payments'), icon: <ArrowRightLeft size={21} />, to: '/transaction' },
    { label: t('nav.more'), icon: <LayoutGrid size={21} />, to: '/more' }
  ];

  const isTabRoute = (p: string) => ['/', '/customer', '/transaction', '/more'].includes(p);
  const activeTab = (p: string) => ['/', '/customer', '/transaction', '/more'].indexOf(p);

  const showNav = isTabRoute(location.pathname);

  return (
    <ThemeProvider theme={theme}>
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
                        key={t.to}
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
