import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined, ShopOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1A1A1A 0%, #2D2D2D 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700} align="center">
            Create Account
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Business Name"
              value={form.business_name}
              error={errors.business_name}
              onChange={set('business_name')}
              InputProps={{ startAdornment: <InputAdornment position="start"><ShopOutlined /></InputAdornment> }}
            />
            <TextField
              fullWidth
              placeholder="Your Name"
              value={form.name}
              error={errors.name}
              onChange={set('name')}
              InputProps={{ startAdornment: <InputAdornment position="start"><UserOutlined /></InputAdornment> }}
            />
            <TextField
              fullWidth
              placeholder="Phone Number"
              value={form.phone}
              error={errors.phone}
              onChange={set('phone')}
              inputProps={{ inputMode: 'numeric', maxLength: 10 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><CountryCodePicker value={country} onChange={setCountry} /></InputAdornment> }}
            />
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 8 characters)"
              value={form.password}
              error={errors.password}
              onChange={set('password')}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={submitting}
              onClick={handleSubmit}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              {submitting ? 'Creating Account…' : 'Create Account'}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600}>
              Sign In
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Register;
