import { useEffect, useState, ChangeEvent } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  RadioGroup,
  Radio
} from '@mui/material';

// project imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import { CameraOutlined, DeleteFilled, UserOutlined } from '@ant-design/icons';

// types
import { ThemeMode } from 'types/config';

const avatarImage = require.context('assets/images/users', true);

// constant
const getInitialValues = (customer: any | null) => {
  const newCustomer = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    status: 1,
    gender: 'male',
    age: 18,
    business: {
      _id: '',
      business_name: ''
    }
  };

  if (customer) {
    return {
      ...newCustomer,
      ...customer
    };
  }

  return newCustomer;
};

const statusOptions = [
  { value: 1, label: 'Active' },
  { value: 2, label: 'Inactive' }
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

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
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Personal Information
                </Typography>
              </Grid>

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
                  <InputLabel htmlFor="customer-email">Email</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-email"
                    placeholder="Enter Customer Email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-phone">Phone</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-phone"
                    placeholder="Enter Phone Number"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-age">Age</InputLabel>
                  <TextField
                    fullWidth
                    id="customer-age"
                    placeholder="Enter Age"
                    value={formData.age}
                    onChange={handleChange('age')}
                    type="number"
                    inputProps={{ min: 1, max: 120 }}
                  />
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
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-status">Status</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="customer-status"
                      value={formData.status}
                      onChange={handleChange('status')}
                      input={<OutlinedInput id="select-customer-status" />}
                      renderValue={(selected) => {
                        const option = statusOptions.find((opt) => opt.value === selected);
                        return <Typography variant="subtitle2">{option?.label || selected}</Typography>;
                      }}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="customer-gender">Gender</InputLabel>
                  <RadioGroup row value={formData.gender} onChange={handleChange('gender')} sx={{ ml: 1 }}>
                    {genderOptions.map((option) => (
                      <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
                    ))}
                  </RadioGroup>
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

              {/* Additional Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Additional Settings
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">Enable Notifications</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Send notifications for orders, payments, and updates
                    </Typography>
                  </Stack>
                  <FormControlLabel control={<Switch defaultChecked sx={{ mt: 0 }} />} label="" labelPlacement="start" />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">VIP Customer</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Mark as VIP customer for special treatment and discounts
                    </Typography>
                  </Stack>
                  <FormControlLabel control={<Switch sx={{ mt: 0 }} />} label="" labelPlacement="start" />
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
