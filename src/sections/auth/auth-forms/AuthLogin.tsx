import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Select,
  MenuItem,
  TextField,
  Box
} from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import countries, { CountryType } from 'data/countries';

import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';

const AuthLogin = ({ isDemo = false }: { isDemo?: boolean }) => {
  const [checked, setChecked] = React.useState(false);

  const { login } = useAuth();
  const scriptedRef = useScriptRef();

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={{
          countryCode: '+91',
          phone: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          countryCode: Yup.string().required('Country code is required'),
          phone: Yup.string()
            .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
            .required('Phone number is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const fullPhoneNumber = `${values.countryCode}${values.phone}`;
            await login(fullPhoneNumber, values.password)
              .then()
              .catch((error) => {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: error.message,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              });
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
            }
          } catch (err: any) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="phone-login">Phone Number</InputLabel>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Select
                      value={values.countryCode}
                      name="countryCode"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.countryCode && errors.countryCode)}
                      sx={{ minWidth: 120 }}
                    >
                      {countries.map((country: CountryType) => (
                        <MenuItem key={country.code} value={country.phone}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{country.code}</Typography>
                            <Typography variant="body2">{country.phone}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      id="phone-login"
                      type="tel"
                      value={values.phone}
                      name="phone"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      fullWidth
                      error={Boolean(touched.phone && errors.phone)}
                      inputProps={{
                        maxLength: 10,
                        pattern: '[0-9]*'
                      }}
                    />
                  </Stack>
                  {touched.countryCode && errors.countryCode && (
                    <FormHelperText error id="standard-weight-helper-text-country-login">
                      {errors.countryCode}
                    </FormHelperText>
                  )}
                  {touched.phone && errors.phone && (
                    <FormHelperText error id="standard-weight-helper-text-phone-login">
                      {errors.phone}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Keep me sign in</Typography>}
                  />
                  <Link variant="h6" component={RouterLink} to={isDemo ? '/auth/forgot-password' : '/forgot-password'} color="text.primary">
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Login
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
