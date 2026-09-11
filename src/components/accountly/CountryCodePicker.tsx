import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField
} from '@mui/material';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import countries, { CountryType } from 'data/countries';

export const DEFAULT_COUNTRY: CountryType = countries.find((c) => c.code === 'IN') || countries[0];

interface CountryCodePickerProps {
  value: CountryType;
  onChange: (c: CountryType) => void;
}

const CountryCodePicker = ({ value, onChange }: CountryCodePickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.label.toLowerCase().includes(q) || c.phone.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        endIcon={<ChevronDown size={14} />}
        sx={{ color: 'text.primary', flexShrink: 0, minWidth: 0, px: 1, fontWeight: 500, fontSize: '0.95rem' }}
      >
        {value.phone}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { height: '70vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, py: 2 }}>
          Select Country
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={16} />
          </IconButton>
        </DialogTitle>
        <Box sx={{ px: 2.5, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search countries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              sx: { fontSize: 13.5 },
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <List sx={{ overflow: 'auto', flex: 1, py: 0 }}>
          {filtered.map((c) => (
            <ListItemButton
              key={c.code}
              dense
              selected={c.code === value.code}
              onClick={() => {
                onChange(c);
                setQuery('');
                setOpen(false);
              }}
              sx={{ py: 1 }}
            >
              <ListItemText
                primary={c.label}
                secondary={c.phone}
                primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
              {c.code === value.code && <Check size={16} color="#E23744" />}
            </ListItemButton>
          ))}
        </List>
      </Dialog>
    </>
  );
};

export default CountryCodePicker;
