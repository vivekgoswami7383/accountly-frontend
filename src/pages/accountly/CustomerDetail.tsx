import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Divider, IconButton, Menu, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import { Phone, MoreHorizontal, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { fetchCustomerTransactions, resetCustomerView } from 'store/reducers/accountly/transactions';
import { useFormatAmount, formatPhone } from 'utils/accountly/format';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
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
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { customers, hasLoaded: customersLoaded } = useSelector((s) => s.customers);
  const { customerTransactions, customerStats, loadedCustomerId, loading } = useSelector((s) => s.transactions);
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);

  const customer = customers.find((x) => x.id === id);
  const av = avatarTint(customer?.name || 'Customer');
  const balance = customerStats.customerBalance ?? customer?.balance ?? 0;
  const isCurrent = loadedCustomerId === id;
  const showSkeleton = !isCurrent && loading;

  useEffect(() => {
    if (!customersLoaded) dispatch(fetchCustomers());
  }, [dispatch, customersLoaded]);

  useEffect(() => {
    if (!id) return;
    if (loadedCustomerId === id) return;
    dispatch(resetCustomerView(id));
    dispatch(fetchCustomerTransactions(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  const headerTitle = (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 500, fontSize: 13, flexShrink: 0 }}
      >
        {initials(customer?.name || 'C')}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 15.5, color: c.ink, lineHeight: 1.15 }} noWrap>
          {customer?.name || 'Customer'}
        </Typography>
        <Typography sx={{ color: c.grey, fontSize: 11.5, fontWeight: 500 }} noWrap>
          {formatPhone(customer?.phone)}
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
          <Settings size={16} /> {t('common.settings')}
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
                  {showSkeleton ? (
                    <>
                      <Skeleton variant="text" width={90} height={30} sx={{ mx: 'auto' }} />
                      <Skeleton variant="text" width={60} height={18} sx={{ mx: 'auto', mt: 0.25 }} />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 22, color: balance < 0 ? c.greenDeep : c.redDeep }}>
                        {fmt(balance)}
                      </Typography>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500, mt: 0.25 }}>
                        {balance < 0 ? t('detail.youWillGet') : t('detail.youWillGive')}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', py: 2.5 }}>
                  {showSkeleton ? (
                    <>
                      <Skeleton variant="text" width={30} height={30} sx={{ mx: 'auto' }} />
                      <Skeleton variant="text" width={80} height={18} sx={{ mx: 'auto', mt: 0.25 }} />
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 22, color: c.slate }}>
                        {customerTransactions.length}
                      </Typography>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500, mt: 0.25 }}>{t('detail.transactions')}</Typography>
                    </>
                  )}
                </Box>
              </Stack>
            </AppCard>
          </Fade>

          {showSkeleton ? (
            <Box>
              <SectionHeader title={t('detail.recentTransactions')} />
              <AppCard sx={{ overflow: 'hidden' }}>
                {[0, 1, 2].map((i) => (
                  <Box key={i}>
                    {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="35%" height={16} />
                      </Box>
                      <Skeleton variant="text" width={56} height={20} />
                    </Stack>
                  </Box>
                ))}
              </AppCard>
            </Box>
          ) : customerTransactions.length > 0 ? (
            <Fade delay={0.05}>
              <Box>
                <SectionHeader title={t('detail.recentTransactions')} />
                <AppCard sx={{ overflow: 'hidden' }}>
                  {customerTransactions.map((tx, i) => {
                    const sent = tx.transaction_type === 'debit';
                    return (
                      <Box key={tx.id}>
                        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                        <ListRow onClick={() => navigate(`/transaction/${tx.id}`)}>
                          <IconDot size={44} bg={sent ? c.redSoft : c.greenSoft} fg={sent ? c.redDeep : c.greenDeep}>
                            {sent ? <ArrowUp /> : <ArrowDown />}
                          </IconDot>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                              {sent ? t('detail.youGave') : t('detail.youGot')}
                            </Typography>
                            <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                              {fmtWhen(tx.createdAt)}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 500, fontSize: 14.5, flexShrink: 0, color: sent ? c.redDeep : c.greenDeep }} noWrap>
                            {fmt(tx.amount)}
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
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 15.5 }}>{t('detail.noTransactionsYet')}</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('detail.recordBelow')}</Typography>
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
              {t('detail.youGaveBtn')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<ArrowDown size={18} />}
              onClick={() => navigate(`/transaction/new?customerId=${id}&type=refund`)}
              sx={{ bgcolor: c.green, boxShadow: 'none', '&:hover': { bgcolor: c.greenDeep } }}
            >
              {t('detail.youGotBtn')}
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CustomerDetail;
