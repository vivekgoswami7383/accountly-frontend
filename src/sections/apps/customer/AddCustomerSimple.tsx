import { useEffect, useState, ChangeEvent } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormLabel,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

// project imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import { CameraOutlined, DeleteFilled, UserOutlined } from '@ant-design/icons';

// types
import { ThemeMode } from 'types/config';
import countries from 'data/countries';

const avatarImage = require.context('assets/images/users', true);

// constant
const getInitialValues = (customer: any | null) => {
  const newCustomer = {
    first_name: '',
    last_name: '',
    phone: '',
    country_code: '+91', // Default to India
    address: '',
    balance: 0
  };

  if (customer) {
    return {
      ...newCustomer,
      ...customer
    };
  }

  return newCustomer;
};

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export interface Props {
  open: boolean;
  customer?: any;
  onCancel: () => void;
  onSave: (customerData: any) => void;
  isEdit?: boolean;
}

const AddCustomerSimple = ({ open, customer, onCancel, onSave, isEdit = false }: Props) => {
  const theme = useTheme();
  const isCreating = !customer;

  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(
    avatarImage(`./avatar-${isCreating && !customer?.avatar ? 1 : customer?.avatar || 1}.png`)
  );

  const [formData, setFormData] = useState(getInitialValues(customer));
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  // Clear errors when dialog opens/closes
  useEffect(() => {
    if (open) {
      setErrors({});
      setFormData(getInitialValues(customer));
    }
  }, [open, customer]);

  const validateForm = () => {
    const newErrors: any = {};

    // Required field validations
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First Name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First Name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last Name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone Number must be exactly 10 digits';
    }

    if (formData.balance && (!/^\d+$/.test(formData.balance.toString()) || isNaN(Number(formData.balance)))) {
      newErrors.balance = 'Balance must be a valid whole number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string) => (event: any) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }

    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onCancel();
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <UserOutlined style={{ fontSize: '1.5rem' }} />
          <Typography variant="h4">{isEdit ? 'Edit Customer' : 'New Customer'}</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <FormLabel
                htmlFor="change-avatar"
                sx={{
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  '&:hover .MuiBox-root': { opacity: 1 },
                  cursor: 'pointer'
                }}
              >
                <Avatar
                  alt="Customer Avatar"
                  src={avatar}
                  sx={{
                    width: 72,
                    height: 72,
                    border: '1px dashed',
                    backgroundColor: theme.palette.primary.lighter
                  }}
                >
                  <UserOutlined style={{ fontSize: '2rem' }} />
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stack spacing={0.5} alignItems="center">
                    <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                    <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                  </Stack>
                </Box>
              </FormLabel>
              <TextField
                type="file"
                id="change-avatar"
                placeholder="Outlined"
                variant="outlined"
                sx={{ display: 'none' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedImage(e.target.files?.[0])}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-first-name">First Name</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-first-name"
                    placeholder="Enter First Name"
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-last-name">Last Name</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-last-name"
                    placeholder="Enter Last Name"
                    value={formData.last_name}
                    onChange={handleChange('last_name')}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-phone">Phone</InputLabel>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Select
                      value={formData.country_code}
                      name="country_code"
                      onChange={handleChange('country_code')}
                      error={!!errors.country_code}
                      sx={{ minWidth: 120 }}
                    >
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.phone}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{country.code}</Typography>
                            <Typography variant="body2">{country.phone}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      fullWidth
                      id="customer-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      error={!!errors.phone}
                      required
                      inputProps={{
                        maxLength: 10,
                        pattern: '[0-9]*'
                      }}
                    />
                  </Stack>
                  {errors.country_code && (
                    <FormHelperText error id="standard-weight-helper-text-country-customer">
                      {errors.country_code}
                    </FormHelperText>
                  )}
                  {errors.phone && (
                    <FormHelperText error id="standard-weight-helper-text-phone-customer">
                      {errors.phone}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-balance">Balance</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-balance"
                    placeholder="Enter Balance"
                    value={formData.balance}
                    onChange={handleChange('balance')}
                    type="number"
                    inputProps={{
                      min: 0,
                      step: 1,
                      pattern: '[0-9]*',
                      inputMode: 'numeric'
                    }}
                    onKeyDown={(e) => {
                      // Prevent decimal point, minus sign, and other non-numeric characters
                      if (e.key === '.' || e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      // Remove any non-numeric characters
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                    }}
                    onWheel={(e) => {
                      // Disable scroll to prevent value increment/decrement
                      e.currentTarget.blur();
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-address">Address</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-address"
                    placeholder="Enter Customer Address"
                    value={formData.address}
                    onChange={handleChange('address')}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            {!isCreating && (
              <Tooltip title="Delete Customer" placement="top">
                <IconButton size="large" color="error">
                  <DeleteFilled />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button color="error" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} variant="contained">
                {isEdit ? 'Update' : 'Add'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomerSimple;
