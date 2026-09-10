import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined, GoogleOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import logo from 'assets/images/accountly/logo/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
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
      showSnackbar({ message: err?.message || 'Login failed. Please try again.', type: 'error' });
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
        alignItems: 'center'
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="Accountly"
              sx={{ width: 200, maxWidth: '80%', height: 'auto', display: 'block', mx: 'auto' }}
            />
          </Box>

          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Phone Number"
              value={phone}
              error={errors.phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              inputProps={{ inputMode: 'numeric', maxLength: 10 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><CountryCodePicker value={country} onChange={setCountry} /></InputAdornment> }}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
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
              {submitting ? 'Signing In…' : 'Sign In'}
            </Button>

            <Divider>OR</Divider>

            <Button fullWidth size="large" variant="outlined" startIcon={<GoogleOutlined />} sx={{ borderRadius: 3, py: 1.5 }}>
              Continue with Google
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" align="center">
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600}>
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
