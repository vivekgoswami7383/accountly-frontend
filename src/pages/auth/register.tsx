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
import { Eye, EyeOff, Store, User, Lock } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'types/config';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import { createAccountlyTheme, getAccountlyColors, DISPLAY } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { MAX_NAME_LENGTH } from 'utils/accountly/limits';
import { FormAlert } from 'components/accountly/kit';
import InstallAppButton from 'components/accountly/InstallAppButton';
import { checkPhone, readPhoneInput } from 'utils/accountly/phone';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { mode } = useConfig();
  const t = useT();
  const accountlyMode = mode === ThemeMode.DARK ? 'dark' : 'light';
  const theme = useMemo(() => createAccountlyTheme(accountlyMode), [accountlyMode]);
  const c = getAccountlyColors(accountlyMode);
  const [country, setCountry] = useState<CountryType>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({ business_name: '', name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = k === 'phone' ? readPhoneInput(country, e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSubmit = async () => {
    const checked = checkPhone(country, form.phone);
    const next: Record<string, boolean> = {
      business_name: !form.business_name.trim(),
      name: !form.name.trim(),
      phone: !checked.valid,
      password: form.password.length < 8
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;
    setSubmitting(true);
    try {
      await register(form.business_name.trim(), form.name.trim(), checked.number, form.password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setFormError(err?.message || t('auth.registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: c.bg, display: 'flex', alignItems: 'center', py: 5 }}>
        <Container maxWidth="xs">
          <Stack spacing={3.5}>
            <Stack alignItems="center" spacing={1.5}>
              <Box sx={{ width: 60, height: 60, borderRadius: '18px', bgcolor: c.redSoft, color: c.red, display: 'grid', placeItems: 'center' }}>
                <Store size={28} />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 24, color: c.ink }}>{t('auth.createYourAccount')}</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13.5 }}>{t('auth.startManaging')}</Typography>
            </Stack>

            <Stack spacing={2}>
              <FormAlert message={formError} />
              <TextField
                fullWidth
                placeholder={t('auth.businessName')}
                value={form.business_name}
                error={errors.business_name}
                onChange={set('business_name')}
                inputProps={{ maxLength: MAX_NAME_LENGTH }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Store size={18} color={c.greyLight} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                placeholder={t('auth.yourName')}
                value={form.name}
                error={errors.name}
                onChange={set('name')}
                inputProps={{ maxLength: MAX_NAME_LENGTH }}
                InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={c.greyLight} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                placeholder={t('auth.enterPhoneNumber')}
                value={form.phone}
                error={errors.phone}
                onChange={set('phone')}
                inputProps={{ inputMode: 'numeric', maxLength: 20 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CountryCodePicker value={country} onChange={setCountry} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={form.password}
                error={errors.password}
                onChange={set('password')}
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
              <Button fullWidth size="large" variant="contained" disabled={submitting} onClick={handleSubmit}>
                {submitting ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
              </Button>
            </Stack>

            <Typography variant="body2" align="center" sx={{ color: c.grey }}>
              {t('auth.alreadyHaveAccount')}{' '}
              <Link component={RouterLink} to="/login" sx={{ color: c.red, fontWeight: 500 }} underline="none">
                {t('auth.signInLink')}
              </Link>
            </Typography>

            <InstallAppButton variant="card" />
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
