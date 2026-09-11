import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Divider, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Search, Phone, ChevronRight, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { formatAmount } from 'utils/accountly/format';
import { c, DISPLAY, avatarTint, initials } from 'themes/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BalanceTag, Fade, ListRow } from 'components/accountly/kit';
import trade from 'assets/images/accountly/illustrations/trade.png';

const Customers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers, hasLoaded } = useSelector((s) => s.customers);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!hasLoaded) dispatch(fetchCustomers());
  }, [dispatch, hasLoaded]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((x) => x.name.toLowerCase().includes(q) || x.phone.includes(q));
  }, [customers, query]);

  const addBtn = (
    <Box
      component="button"
      onClick={() => navigate('/customer/add')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: 'none',
        cursor: 'pointer',
        bgcolor: c.red,
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        px: 1.5,
        py: 0.875,
        borderRadius: '999px',
        fontFamily: `'Inter', sans-serif`
      }}
    >
      <Plus size={15} /> Add
    </Box>
  );

  return (
    <>
      <AppHeader variant="root" title="Customers" right={addBtn} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2}>
          {customers.length > 0 && (
            <TextField
              fullWidth
              placeholder="Search by name or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={c.greyLight} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '16px', boxShadow: '0 1px 2px rgba(20,23,26,0.03)' }
              }}
            />
          )}

          {!hasLoaded ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="55%" height={20} />
                      <Skeleton variant="text" width="35%" height={16} />
                    </Box>
                    <Skeleton variant="text" width={56} height={20} />
                  </Stack>
                </Box>
              ))}
            </AppCard>
          ) : filtered.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box component="img" src={trade} alt="" sx={{ width: 96, height: 96, objectFit: 'contain', mb: 1.75, opacity: 0.95 }} />
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
                {query ? 'No matches' : 'No customers yet'}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>
                {query ? 'Try a different name or number.' : 'Tap Add to create your first customer.'}
              </Typography>
            </AppCard>
          ) : (
            <Fade>
              <AppCard sx={{ overflow: 'hidden' }}>
                {filtered.map((cust, i) => {
                  const get = cust.balance < 0;
                  const av = avatarTint(cust.name);
                  return (
                    <Box key={cust.id}>
                      {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                      <ListRow onClick={() => navigate(`/customer/${cust.id}`)}>
                        <Box
                          sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, flexShrink: 0 }}
                        >
                          {initials(cust.name)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: c.ink }} noWrap>
                            {cust.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0, mt: 0.25 }}>
                            <Phone size={12} color={c.greyLight} style={{ flexShrink: 0 }} />
                            <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                              {cust.phone}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: get ? c.greenDeep : c.redDeep }} noWrap>
                            {formatAmount(cust.balance)}
                          </Typography>
                          <BalanceTag tone={get ? 'get' : 'give'}>{get ? 'GET' : 'GIVE'}</BalanceTag>
                        </Stack>
                        <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                      </ListRow>
                    </Box>
                  );
                })}
              </AppCard>
            </Fade>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Customers;
