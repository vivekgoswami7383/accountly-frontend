import { useState } from 'react';
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { User, Phone, MapPin } from 'lucide-react';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import { c, DISPLAY, avatarTint, initials } from 'themes/accountly';
import { BottomActionBar, FOOTER_SPACE } from 'components/accountly/kit';

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

const Label = ({ children }: { children: string }) => (
  <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: c.grey, mb: 0.75, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
    {children}
  </Typography>
);

const CustomerForm = ({ initial, submitLabel, loading, onSubmit }: CustomerFormProps) => {
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [country, setCountry] = useState<CountryType>(initial?.country || DEFAULT_COUNTRY);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const av = avatarTint(name || 'C');

  const handleSubmit = () => {
    const next = { name: !name.trim(), phone: !validatePhone(phone) };
    setErrors(next);
    if (next.name || next.phone) return;
    onSubmit({ name: name.trim(), phone: `${country.phone}${phone}`, address: address.trim() });
  };

  return (
    <Box sx={{ pb: FOOTER_SPACE }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
        <Box
          sx={{ width: 84, height: 84, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 700, fontSize: 30 }}
        >
          {initials(name || 'C')}
        </Box>
      </Box>

      <Stack spacing={2.5}>
        <Box>
          <Label>Customer Name</Label>
          <TextField
            fullWidth
            placeholder="Enter name"
            value={name}
            error={errors.name}
            helperText={errors.name ? 'Name is required' : undefined}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={c.greyLight} /></InputAdornment> }}
          />
        </Box>

        <Box>
          <Label>Phone Number</Label>
          <TextField
            fullWidth
            placeholder="Enter phone number"
            value={phone}
            error={errors.phone}
            helperText={errors.phone ? 'Enter a valid 10-digit number' : undefined}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone size={16} color={c.greyLight} />
                  <CountryCodePicker value={country} onChange={setCountry} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box>
          <Label>Address</Label>
          <Box
            sx={{
              bgcolor: c.surface,
              borderRadius: '14px',
              border: `1.5px solid ${c.border}`,
              px: 2,
              py: 1.75,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25
            }}
          >
            <MapPin size={18} color={c.greyLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <Box
              component="textarea"
              rows={3}
              placeholder="Optional"
              value={address}
              onChange={(e: any) => setAddress(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                resize: 'none',
                bgcolor: 'transparent',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: c.ink,
                '::placeholder': { color: c.greyLight }
              }}
            />
          </Box>
        </Box>
      </Stack>

      <BottomActionBar>
        <Button fullWidth size="large" variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Saving…' : submitLabel}
        </Button>
      </BottomActionBar>
    </Box>
  );
};

export default CustomerForm;
