import { Box, Card, Divider, FormControl, MenuItem, Select, Stack, Switch, Typography } from '@mui/material';
import { ThemeMode, I18n } from 'types/config';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import ScreenHeader from 'components/accountly/ScreenHeader';

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
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <ScreenHeader title="Settings" />

      <Card sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Preferences
        </Typography>

        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
            <Box>
              <Typography>Dark Mode</Typography>
              <Typography variant="body2" color="text.secondary">
                Match the Accountly app theme
              </Typography>
            </Box>
            <Switch checked={mode === ThemeMode.DARK} onChange={(e) => handleThemeToggle(e.target.checked)} />
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
            <Typography>Language</Typography>
            <FormControl size="small">
              <Select value={i18n} onChange={(e) => onChangeLocalization(e.target.value as I18n)}>
                {languages.map((l) => (
                  <MenuItem key={l.value} value={l.value}>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default Settings;
