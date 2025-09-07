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
  Typography
} from '@mui/material';

// project imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import { CameraOutlined, DeleteFilled, ShopOutlined } from '@ant-design/icons';

// types
import { ThemeMode } from 'types/config';

const avatarImage = require.context('assets/images/users', true);

// constant
const getInitialValues = (business: any | null) => {
  const newBusiness = {
    business_name: '',
    business_type: 'kirana_shop',
    address: '',
    gst_number: '',
    user: {
      first_name: '',
      last_name: '',
      phone: '',
      password: ''
    }
  };

  if (business) {
    return {
      ...newBusiness,
      ...business,
      user: {
        ...newBusiness.user,
        ...business.user
      }
    };
  }

  return newBusiness;
};

const businessTypes = [
  { value: 'kirana_shop', label: 'Kirana Shop' },
  { value: 'pan_shop', label: 'Pan Shop' },
  { value: 'grocery_store', label: 'Grocery Store' },
  { value: 'medical_store', label: 'Medical Store' },
  { value: 'electronics', label: 'Electronics Store' },
  { value: 'clothing', label: 'Clothing Store' },
  { value: 'other', label: 'Other' }
];

// ==============================|| BUSINESS ADD / EDIT ||============================== //

export interface Props {
  open: boolean;
  business?: any;
  onCancel: () => void;
  onSave: (businessData: any) => void;
  isEdit?: boolean;
}

const AddBusiness = ({ open, business, onCancel, onSave, isEdit = false }: Props) => {
  const theme = useTheme();
  const isCreating = !business;

  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(
    avatarImage(`./avatar-${isCreating && !business?.avatar ? 1 : business?.avatar || 1}.png`)
  );

  const [formData, setFormData] = useState(getInitialValues(business));
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
      setFormData(getInitialValues(business));
    }
  }, [open, business]);

  const validateForm = () => {
    const newErrors: any = {};

    // Business Name validation
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business Name is required';
    }

    // Owner Information validation
    if (!formData.user.first_name.trim()) {
      newErrors['user.first_name'] = 'First Name is required';
    }

    if (!formData.user.last_name.trim()) {
      newErrors['user.last_name'] = 'Last Name is required';
    }

    if (!formData.user.phone.trim()) {
      newErrors['user.phone'] = 'Phone Number is required';
    }

    // Password validation (only for new businesses)
    if (!isEdit && !formData.user.password.trim()) {
      newErrors['user.password'] = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string) => (event: any) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }

    if (field.startsWith('user.')) {
      const userField = field.split('.')[1];
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          [userField]: event.target.value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: event.target.value
      });
    }
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
          <ShopOutlined style={{ fontSize: '1.5rem' }} />
          <Typography variant="h4">{isEdit ? 'Edit Business' : 'New Business'}</Typography>
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
                  alt="Business Avatar"
                  src={avatar}
                  sx={{
                    width: 72,
                    height: 72,
                    border: '1px dashed',
                    backgroundColor: theme.palette.primary.lighter
                  }}
                >
                  <ShopOutlined style={{ fontSize: '2rem' }} />
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
              {/* Business Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Business Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="business-name">Business Name</InputLabel>
                  <TextField
                    fullWidth
                    id="business-name"
                    placeholder="Enter Business Name"
                    value={formData.business_name}
                    onChange={handleChange('business_name')}
                    error={!!errors.business_name}
                    helperText={errors.business_name}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="business-type">Business Type</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="business-type"
                      value={formData.business_type}
                      onChange={handleChange('business_type')}
                      input={<OutlinedInput id="select-business-type" />}
                      renderValue={(selected) => {
                        const option = businessTypes.find((opt) => opt.value === selected);
                        return <Typography variant="subtitle2">{option?.label || selected}</Typography>;
                      }}
                    >
                      {businessTypes.map((option) => (
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
                  <InputLabel htmlFor="business-address">Address</InputLabel>
                  <TextField
                    fullWidth
                    id="business-address"
                    placeholder="Enter Business Address"
                    value={formData.address}
                    onChange={handleChange('address')}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="business-gst">GST Number</InputLabel>
                  <TextField
                    fullWidth
                    id="business-gst"
                    placeholder="Enter GST Number"
                    value={formData.gst_number}
                    onChange={handleChange('gst_number')}
                  />
                </Stack>
              </Grid>

              {/* Owner Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Owner Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="owner-first-name">First Name</InputLabel>
                  <TextField
                    fullWidth
                    id="owner-first-name"
                    placeholder="Enter First Name"
                    value={formData.user.first_name}
                    onChange={handleChange('user.first_name')}
                    error={!!errors['user.first_name']}
                    helperText={errors['user.first_name']}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="owner-last-name">Last Name</InputLabel>
                  <TextField
                    fullWidth
                    id="owner-last-name"
                    placeholder="Enter Last Name"
                    value={formData.user.last_name}
                    onChange={handleChange('user.last_name')}
                    error={!!errors['user.last_name']}
                    helperText={errors['user.last_name']}
                    required
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="owner-phone">Phone Number</InputLabel>
                  <TextField
                    fullWidth
                    id="owner-phone"
                    placeholder="Enter Phone Number"
                    value={formData.user.phone}
                    onChange={handleChange('user.phone')}
                    error={!!errors['user.phone']}
                    helperText={errors['user.phone']}
                    required
                  />
                </Stack>
              </Grid>

              {!isEdit && (
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="owner-password">Password</InputLabel>
                    <TextField
                      fullWidth
                      id="owner-password"
                      type="password"
                      placeholder="Enter Password"
                      value={formData.user.password}
                      onChange={handleChange('user.password')}
                      error={!!errors['user.password']}
                      helperText={errors['user.password']}
                      required
                    />
                  </Stack>
                </Grid>
              )}

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
                      Receive notifications for new orders, payments, and updates
                    </Typography>
                  </Stack>
                  <FormControlLabel control={<Switch defaultChecked sx={{ mt: 0 }} />} label="" labelPlacement="start" />
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
              <Tooltip title="Delete Business" placement="top">
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

export default AddBusiness;
