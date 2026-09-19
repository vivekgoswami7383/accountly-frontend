import { useState } from 'react';
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { User, Phone, MapPin } from 'lucide-react';
import CountryCodePicker, { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { CountryType } from 'data/countries';
import { checkPhone, readPhoneInput } from 'utils/accountly/phone';
import { ContactType } from 'services/accountly/types';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { BottomActionBar, FOOTER_SPACE, FormAlert } from 'components/accountly/kit';
import UploadableAvatar from 'components/accountly/UploadableAvatar';
import ContactTypeChips from 'components/accountly/ContactTypeChips';
import { MAX_NAME_LENGTH } from 'utils/accountly/limits';

export interface ContactFormValues {
  name: string;
  phone: string;
  address: string;
  country: CountryType;
  contactType: ContactType | null;
}

interface ContactFormProps {
  initial?: Partial<ContactFormValues>;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  imageUrl?: string | null;
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  onSubmit: (values: { name: string; phone: string; address: string; contactType: ContactType | null }) => void;
}

const Label = ({ children }: { children: string }) => {
  const c = useAccountlyColors();
  return (
    <Typography sx={{ fontWeight: 500, fontSize: 12.5, color: c.grey, mb: 0.75, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
      {children}
    </Typography>
  );
};

const ContactForm = ({ initial, submitLabel, loading, error, imageUrl, onImageSelect, onImageRemove, onSubmit }: ContactFormProps) => {
  const c = useAccountlyColors();
  const t = useT();
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [contactType, setContactType] = useState<ContactType | null>(initial ? initial.contactType ?? null : 'customer');
  const [country, setCountry] = useState<CountryType>(initial?.country || DEFAULT_COUNTRY);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const av = avatarTint(name || 'C');

  const handleSubmit = () => {
    const unchanged = Boolean(initial) && phone === initial?.phone && country.code === initial?.country?.code;
    const checked = checkPhone(country, phone);
    const next = { name: !name.trim(), phone: !unchanged && !checked.valid };
    setErrors(next);
    if (next.name || next.phone) return;
    onSubmit({ name: name.trim(), phone: unchanged ? `${country.phone}${phone}` : checked.number, address: address.trim(), contactType });
  };

  return (
    <Box sx={{ pb: FOOTER_SPACE }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
        {onImageSelect ? (
          <UploadableAvatar
            size={84}
            imageUrl={imageUrl}
            fallback={initials(name || 'C')}
            bg={av.bg}
            fg={av.fg}
            onSelect={onImageSelect}
            onRemove={onImageRemove}
          />
        ) : (
          <Box
            sx={{ width: 84, height: 84, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 500, fontSize: 30 }}
          >
            {initials(name || 'C')}
          </Box>
        )}
      </Box>

      <Stack spacing={2.5}>
        {error && <FormAlert message={error} />}
        <Box>
          <Label>{t('contactForm.contactName')}</Label>
          <TextField
            fullWidth
            placeholder={t('contactForm.enterName')}
            value={name}
            error={errors.name}
            helperText={errors.name ? t('contactForm.nameRequired') : undefined}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: MAX_NAME_LENGTH }}
            InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={c.greyLight} /></InputAdornment> }}
          />
        </Box>

        <Box>
          <Label>{t('contactForm.phoneNumber')}</Label>
          <TextField
            fullWidth
            placeholder={t('contactForm.enterPhoneNumber')}
            value={phone}
            error={errors.phone}
            helperText={errors.phone ? t('contactForm.invalidPhone') : undefined}
            onChange={(e) => setPhone(readPhoneInput(country, e.target.value))}
            inputProps={{ inputMode: 'numeric', maxLength: 20 }}
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
          <Label>{t('contactType.title')}</Label>
          <ContactTypeChips value={contactType} onChange={setContactType} />
        </Box>

        <Box>
          <Label>{t('contactForm.address')}</Label>
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
              placeholder={t('contactForm.optional')}
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
          {loading ? t('common.saving') : submitLabel}
        </Button>
      </BottomActionBar>
    </Box>
  );
};

export default ContactForm;
