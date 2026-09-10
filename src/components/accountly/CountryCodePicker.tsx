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
  TextField,
  Typography
} from '@mui/material';
import { DownOutlined, SearchOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
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
        endIcon={<DownOutlined style={{ fontSize: 12 }} />}
        sx={{ color: 'text.primary', flexShrink: 0, minWidth: 0, px: 1 }}
      >
        {value.phone}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { height: '80vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Select Country</Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <Box sx={{ px: 3, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search countries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <List sx={{ overflow: 'auto', flex: 1 }}>
          {filtered.map((c) => (
            <ListItemButton
              key={c.code}
              selected={c.code === value.code}
              onClick={() => {
                onChange(c);
                setQuery('');
                setOpen(false);
              }}
            >
              <ListItemText primary={c.label} secondary={c.phone} />
              {c.code === value.code && <CheckOutlined style={{ color: '#007AFF' }} />}
            </ListItemButton>
          ))}
        </List>
      </Dialog>
    </>
  );
};

export default CountryCodePicker;
