import { Box, Container, Divider, FormControl, MenuItem, Select, Stack, Switch, Typography } from '@mui/material';
import { ThemeMode, I18n } from 'types/config';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import currencies from 'data/currencies';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard } from 'components/accountly/kit';

const languages: { value: I18n; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'gu', label: 'ગુજરાતી' },
  { value: 'hi-latn', label: 'Hinglish' },
  { value: 'gu-latn', label: 'Gujlish' }
];

const Settings = () => {
  const { mode, onChangeMode, language, onChangeLocalization, currency, onChangeCurrency } = useConfig();
  const { user, updateProfile, updateBusiness } = useAuth();
  const { showSnackbar } = useSnackbar();
  const c = useAccountlyColors();
  const t = useT();

  const handleThemeToggle = async (dark: boolean) => {
    const next = dark ? ThemeMode.DARK : ThemeMode.LIGHT;
    onChangeMode(next);
    try {
      if (user) await updateProfile({ theme: next });
    } catch {
      showSnackbar({ message: t('settings.themeSaveFail'), type: 'error' });
    }
  };

  const handleLanguageChange = async (next: I18n) => {
    onChangeLocalization(next);
    try {
      if (user) await updateProfile({ language: next });
    } catch {
      showSnackbar({ message: t('settings.languageSaveFail'), type: 'error' });
    }
  };

  const handleCurrencyChange = async (next: string) => {
    const previous = currency;
    onChangeCurrency(next);
    try {
      await updateBusiness({ currency: next });
    } catch {
      onChangeCurrency(previous);
      showSnackbar({ message: t('settings.currencySaveFail'), type: 'error' });
    }
  };

  return (
    <>
      <AppHeader variant="screen" title={t('settings.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <AppCard sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 15, mb: 2 }}>{t('settings.preferences')}</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{t('settings.darkMode')}</Typography>
                <Typography sx={{ color: c.grey, fontSize: 12.5 }}>{t('settings.darkModeSub')}</Typography>
              </Box>
              <Switch checked={mode === ThemeMode.DARK} onChange={(e) => handleThemeToggle(e.target.checked)} />
            </Stack>
            <Divider sx={{ borderColor: c.line }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{t('settings.language')}</Typography>
              <FormControl size="small">
                <Select value={language} onChange={(e) => handleLanguageChange(e.target.value as I18n)} sx={{ borderRadius: '12px' }}>
                  {languages.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                      {l.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Divider sx={{ borderColor: c.line }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{t('settings.currency')}</Typography>
              <FormControl size="small">
                <Select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as string)}
                  sx={{ borderRadius: '12px', maxWidth: 160 }}
                  renderValue={(value) => {
                    const cur = currencies.find((x) => x.code === value);
                    return cur ? `${cur.code} ${cur.symbol}` : value;
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                >
                  {currencies.map((cur) => (
                    <MenuItem key={cur.code} value={cur.code}>
                      {cur.country} — {cur.code} ({cur.symbol})
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
