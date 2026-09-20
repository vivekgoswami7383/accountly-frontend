import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  ThemeProvider,
  Typography
} from '@mui/material';
import { Eye, EyeOff, Store, Lock } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'types/config';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import { createAccountlyTheme, getAccountlyColors, DISPLAY } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { FormAlert } from 'components/accountly/kit';
import InstallAppButton from 'components/accountly/InstallAppButton';
import { checkPhone, readPhoneInput } from 'utils/accountly/phone';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const checked = checkPhone(country, phone);
    const next = { phone: !checked.possible, password: !password.trim() };
    setErrors(next);
    setFormError(null);
    if (next.phone || next.password) return;
    setSubmitting(true);
    try {
      await login(checked.number, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setFormError(err?.message || t('auth.loginFailed'));
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
                onChange={(e) => setPhone(readPhoneInput(country, e.target.value))}
                inputProps={{ inputMode: 'numeric', maxLength: 20 }}
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
                  startAdornment: <InputAdornment position="start"><Lock size={18} color={c.greyLight} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormAlert message={formError} />
              <Button fullWidth size="large" variant="contained" disabled={submitting} onClick={handleSubmit}>
                {submitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </Stack>

            <Typography variant="body2" align="center" sx={{ color: c.grey }}>
              {t('auth.newToAccountly')}{' '}
              <Link component={RouterLink} to="/register" sx={{ color: c.red, fontWeight: 500 }} underline="none">
                {t('auth.createAccount')}
              </Link>
            </Typography>

            <InstallAppButton variant="card" />
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
