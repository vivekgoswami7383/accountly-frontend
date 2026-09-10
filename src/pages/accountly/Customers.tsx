import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Fab, InputAdornment, Stack, TextField, Typography, alpha, useMediaQuery, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SearchOutlined, PhoneOutlined, UserAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import CustomerAvatar from 'components/accountly/CustomerAvatar';
import EmptyState from 'components/accountly/EmptyState';
import { formatAmount, balanceLabel } from 'utils/accountly/format';
import trade from 'assets/images/accountly/illustrations/trade.png';

const Customers = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { customers } = useSelector((s) => s.customers);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, query]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {customers.length > 0 && (
          <TextField
            fullWidth
            size="small"
            placeholder="Search customers"
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
        )}
        {isDesktop && (
          <Button variant="contained" startIcon={<PlusOutlined />} sx={{ flexShrink: 0 }} onClick={() => navigate('/customer/add')}>
            Add Customer
          </Button>
        )}
      </Stack>

      {filtered.length === 0 ? (
        <EmptyState
          illustration={trade}
          title="Customers Not Found"
          description={query ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 1.5,
            width: '100%'
          }}
        >
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => navigate(`/customer/${c.id}`)}
              sx={{
                p: 2,
                borderRadius: 3,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
              }}
            >
              <CustomerAvatar name={c.name} sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {c.name}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <PhoneOutlined style={{ fontSize: 12, color: theme.palette.text.secondary, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {c.phone}
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} color={c.balance < 0 ? 'success.main' : 'error.main'} noWrap>
                  {formatAmount(c.balance)}
                </Typography>
                <Typography variant="caption" color={c.balance < 0 ? 'success.main' : 'error.main'} noWrap component="div">
                  {balanceLabel(c.balance)}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {!isDesktop && (
        <Fab
          color="primary"
          aria-label="add customer"
          onClick={() => navigate('/customer/add')}
          sx={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', right: 20 }}
        >
          <UserAddOutlined style={{ fontSize: 20 }} />
        </Fab>
      )}
    </Box>
  );
};

export default Customers;
