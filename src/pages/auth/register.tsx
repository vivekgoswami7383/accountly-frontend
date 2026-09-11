import { useState } from 'react';
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
import useSnackbar from 'hooks/useSnackbar';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import accountlyTheme, { c, DISPLAY } from 'themes/accountly';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [country, setCountry] = useState<CountryType>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({ business_name: '', name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = k === 'phone' ? e.target.value.replace(/[^0-9]/g, '').slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSubmit = async () => {
    const next: Record<string, boolean> = {
      business_name: !form.business_name.trim(),
      name: !form.name.trim(),
      phone: !/^[0-9]{10}$/.test(form.phone),
      password: form.password.length < 8
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSubmitting(true);
    try {
      await register(form.business_name.trim(), form.name.trim(), `${country.phone}${form.phone}`, form.password);
      navigate('/', { replace: true });
    } catch (err: any) {
      showSnackbar({ message: err?.message || 'Registration failed. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={accountlyTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: c.bg, display: 'flex', alignItems: 'center', py: 5 }}>
        <Container maxWidth="xs">
          <Stack spacing={3.5}>
            <Stack alignItems="center" spacing={1}>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: c.ink }}>Create your account</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13.5 }}>Start managing your khata in minutes</Typography>
            </Stack>

            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Business name"
                value={form.business_name}
                error={errors.business_name}
                onChange={set('business_name')}
                InputProps={{ startAdornment: <InputAdornment position="start"><Store size={18} color={c.greyLight} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                placeholder="Your name"
                value={form.name}
                error={errors.name}
                onChange={set('name')}
                InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={c.greyLight} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                placeholder="Enter phone number"
                value={form.phone}
                error={errors.phone}
                onChange={set('phone')}
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CountryCodePicker value={country} onChange={setCountry} /></InputAdornment> }}
              />
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
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
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </Stack>

            <Typography variant="body2" align="center" sx={{ color: c.grey }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: c.red, fontWeight: 700 }} underline="none">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
