import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Phone, MoreHorizontal, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { fetchCustomerTransactions } from 'store/reducers/accountly/transactions';
import { formatAmount, balanceLabel } from 'utils/accountly/format';
import { c, DISPLAY, avatarTint, initials } from 'themes/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, ListRow, IconDot, SectionHeader } from 'components/accountly/kit';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '');
};

const CustomerDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers } = useSelector((s) => s.customers);
  const { transactions, customerStats } = useSelector((s) => s.transactions);
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);

  const customer = customers.find((x) => x.id === id);
  const av = avatarTint(customer?.name || 'Customer');
  const balance = customerStats.customerBalance ?? customer?.balance ?? 0;

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (id) dispatch(fetchCustomerTransactions(id));
  }, [dispatch, id]);

  const headerTitle = (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, flexShrink: 0 }}
      >
        {initials(customer?.name || 'C')}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15.5, color: c.ink, lineHeight: 1.15 }} noWrap>
          {customer?.name || 'Customer'}
        </Typography>
        <Typography sx={{ color: c.grey, fontSize: 11.5, fontWeight: 500 }} noWrap>
          {customer?.phone || ''}
        </Typography>
      </Box>
    </Stack>
  );

  const headerRight = (
    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
      {customer?.phone && (
        <IconButton component="a" href={`tel:${customer.phone}`} sx={{ color: c.ink }}>
          <Phone size={18} />
        </IconButton>
      )}
      <IconButton onClick={(e) => setMenuEl(e.currentTarget)} sx={{ color: c.ink }}>
        <MoreHorizontal size={20} />
      </IconButton>
      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            navigate(`/customer/${id}/settings`);
          }}
          sx={{ gap: 1.25 }}
        >
          <Settings size={16} /> Settings
        </MenuItem>
      </Menu>
    </Stack>
  );

  return (
    <>
      <AppHeader variant="screen" title={headerTitle} right={headerRight} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: `calc(96px + env(safe-area-inset-bottom, 0px))` }}>
        <Stack spacing={2.25}>
          <Fade>
            <AppCard sx={{ p: 0 }}>
              <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: c.line }} />}>
                <Box sx={{ flex: 1, textAlign: 'center', py: 2.5 }}>
                  <Typography sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: balance < 0 ? c.greenDeep : c.redDeep }}>
                    {formatAmount(balance)}
                  </Typography>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 600, mt: 0.25 }}>{balanceLabel(balance)}</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', py: 2.5 }}>
                  <Typography sx={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: c.slate }}>{transactions.length}</Typography>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 600, mt: 0.25 }}>Transactions</Typography>
                </Box>
              </Stack>
            </AppCard>
          </Fade>

          {transactions.length > 0 ? (
            <Fade delay={0.05}>
              <Box>
                <SectionHeader title="Recent Transactions" />
                <AppCard sx={{ overflow: 'hidden' }}>
                  {transactions.map((t, i) => {
                    const sent = t.transaction_type === 'debit';
                    return (
                      <Box key={t.id}>
                        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                        <ListRow onClick={() => navigate(`/transaction/${t.id}`)}>
                          <IconDot size={44} bg={sent ? c.redSoft : c.greenSoft} fg={sent ? c.redDeep : c.greenDeep}>
                            {sent ? <ArrowUp /> : <ArrowDown />}
                          </IconDot>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: c.ink }} noWrap>
                              {sent ? 'You gave' : 'You got'} {formatAmount(t.amount)}
                            </Typography>
                            <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                              {fmtWhen(t.createdAt)}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 14.5, flexShrink: 0, color: sent ? c.redDeep : c.greenDeep }} noWrap>
                            {sent ? '−' : '+'}
                            {formatAmount(t.amount)}
                          </Typography>
                        </ListRow>
                      </Box>
                    );
                  })}
                </AppCard>
              </Box>
            </Fade>
          ) : (
            <AppCard sx={{ px: 3, py: 4.5, textAlign: 'center' }}>
              <Box component="img" src={onlinePayment} alt="" sx={{ width: 96, height: 96, objectFit: 'contain', mb: 1.5, opacity: 0.95 }} />
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15.5 }}>No transactions yet</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>Record a Send or Receive below.</Typography>
            </AppCard>
          )}
        </Stack>
      </Container>

      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 25,
          px: 1.5,
          pt: 1.5,
          pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          background: `linear-gradient(180deg, rgba(238,241,245,0) 0%, ${c.bg} 40%)`,
          pointerEvents: 'none'
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack direction="row" spacing={1.25} sx={{ pointerEvents: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ArrowUp size={18} />}
              onClick={() => navigate(`/transaction/new?customerId=${id}&type=payment`)}
              sx={{ bgcolor: c.red, boxShadow: 'none', '&:hover': { bgcolor: c.redDeep } }}
            >
              You Gave
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<ArrowDown size={18} />}
              onClick={() => navigate(`/transaction/new?customerId=${id}&type=refund`)}
              sx={{ bgcolor: c.green, boxShadow: 'none', '&:hover': { bgcolor: c.greenDeep } }}
            >
              You Got
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CustomerDetail;
