import { Box, Container, Divider, FormControl, MenuItem, Select, Stack, Switch, Typography } from '@mui/material';
import { ThemeMode, I18n } from 'types/config';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import { c, DISPLAY } from 'themes/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard } from 'components/accountly/kit';

const languages: { value: I18n; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'gu', label: 'ગુજરાતી' }
];

const Settings = () => {
  const { mode, onChangeMode, i18n, onChangeLocalization } = useConfig();
  const { user, updateProfile } = useAuth();
  const { showSnackbar } = useSnackbar();

  const handleThemeToggle = async (dark: boolean) => {
    const next = dark ? ThemeMode.DARK : ThemeMode.LIGHT;
    onChangeMode(next);
    try {
      if (user) await updateProfile({ theme: next });
    } catch {
      showSnackbar({ message: 'Could not save theme preference', type: 'error' });
    }
  };

  return (
    <>
      <AppHeader variant="screen" title="Settings" />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <AppCard sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, mb: 2 }}>Preferences</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Dark mode</Typography>
                <Typography sx={{ color: c.grey, fontSize: 12.5 }}>Use a dark colour theme</Typography>
              </Box>
              <Switch checked={mode === ThemeMode.DARK} onChange={(e) => handleThemeToggle(e.target.checked)} />
            </Stack>
            <Divider sx={{ borderColor: c.line }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Language</Typography>
              <FormControl size="small">
                <Select value={i18n} onChange={(e) => onChangeLocalization(e.target.value as I18n)} sx={{ borderRadius: '12px' }}>
                  {languages.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                      {l.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </AppCard>
      </Container>
    </>
  );
};

export default Settings;
