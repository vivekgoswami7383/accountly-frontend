import { useState } from 'react';
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import CustomerPhotoField from 'components/accountly/CustomerPhotoField';
import { CountryType } from 'data/countries';

export interface CustomerFormValues {
  name: string;
  phone: string;
  address: string;
  country: CountryType;
}

interface CustomerFormProps {
  initial?: Partial<CustomerFormValues>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: { name: string; phone: string; address: string }) => void;
}

const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);

const CustomerForm = ({ initial, submitLabel, loading, onSubmit }: CustomerFormProps) => {
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [country, setCountry] = useState<CountryType>(initial?.country || DEFAULT_COUNTRY);
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const handleSubmit = () => {
    const next = { name: !name.trim(), phone: !validatePhone(phone) };
    setErrors(next);
    if (next.name || next.phone) return;
    onSubmit({ name: name.trim(), phone: `${country.phone}${phone}`, address: address.trim() });
  };

  return (
    <Box>
      <CustomerPhotoField name={name} image={image} onImageChange={setImage} />

      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Customer Name
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter name"
            value={name}
            error={errors.name}
            helperText={errors.name ? 'Name is required' : ' '}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><UserOutlined /></InputAdornment> }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Phone Number
          </Typography>
          <TextField
            fullWidth
            placeholder="Phone Number"
            value={phone}
            error={errors.phone}
            helperText={errors.phone ? 'Enter a valid 10-digit phone number' : ' '}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlined />
                  <CountryCodePicker value={country} onChange={setCountry} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Address
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><EnvironmentOutlined /></InputAdornment> }}
          />
        </Box>

        <Button fullWidth size="large" variant="contained" disabled={loading} onClick={handleSubmit} sx={{ borderRadius: 3, py: 1.5, mt: 1 }}>
          {loading ? 'Saving…' : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};

export default CustomerForm;
