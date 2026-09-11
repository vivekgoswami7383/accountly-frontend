import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  ThemeProvider,
  Typography
} from '@mui/material';
import { Eye, EyeOff, Store } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'types/config';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import { createAccountlyTheme, getAccountlyColors, DISPLAY } from 'themes/accountly';
import { useT } from 'i18n/accountly';

const GoogleIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden focusable="false">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 3-2.26 5.54-4.78 7.27l7.73 6c4.51-4.18 7.09-10.36 7.09-17.74z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { mode } = useConfig();
  const t = useT();
  const accountlyMode = mode === ThemeMode.DARK ? 'dark' : 'light';
  const theme = useMemo(() => createAccountlyTheme(accountlyMode), [accountlyMode]);
  const c = getAccountlyColors(accountlyMode);
  const [country, setCountry] = useState<CountryType>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ phone?: boolean; password?: boolean }>({});

  const handleSubmit = async () => {
    const next = { phone: !/^[0-9]{10}$/.test(phone), password: !password.trim() };
    setErrors(next);
    if (next.phone || next.password) return;
    setSubmitting(true);
    try {
      await login(`${country.phone}${phone}`, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      showSnackbar({ message: err?.message || t('auth.loginFailed'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: c.bg, display: 'flex', alignItems: 'center', py: 5 }}>
        <Container maxWidth="xs">
          <Stack spacing={4}>
            <Stack alignItems="center" spacing={1.5}>
              <Box sx={{ width: 60, height: 60, borderRadius: '18px', bgcolor: c.redSoft, color: c.red, display: 'grid', placeItems: 'center' }}>
                <Store size={28} />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 24, color: c.ink }}>{t('auth.welcomeBack')}</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13.5 }}>{t('auth.signInToKhata')}</Typography>
            </Stack>

            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder={t('auth.enterPhoneNumber')}
                value={phone}
                error={errors.phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CountryCodePicker value={country} onChange={setCountry} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={password}
                error={errors.password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button fullWidth size="large" variant="contained" disabled={submitting} onClick={handleSubmit}>
                {submitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
              <Divider sx={{ color: c.greyLight, fontSize: 12, '&::before, &::after': { borderColor: c.border } }}>{t('auth.or')}</Divider>
              <Button fullWidth size="large" variant="outlined" startIcon={<GoogleIcon />}>
                {t('auth.continueWithGoogle')}
              </Button>
            </Stack>

            <Typography variant="body2" align="center" sx={{ color: c.grey }}>
              {t('auth.newToAccountly')}{' '}
              <Link component={RouterLink} to="/register" sx={{ color: c.red, fontWeight: 500 }} underline="none">
                {t('auth.createAccount')}
              </Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
