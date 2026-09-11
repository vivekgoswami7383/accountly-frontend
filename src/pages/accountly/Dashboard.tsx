import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { ArrowUp, ArrowDown, UserPlus, Zap, FileText, ChevronRight, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchDashboardStatistics } from 'store/reducers/accountly/dashboard';
import { formatAmount } from 'utils/accountly/format';
import { c, DISPLAY, shadow, avatarTint, initials } from 'themes/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BalanceTag, Fade, IconDot, ListRow, MotionButton, SectionHeader } from 'components/accountly/kit';
import trade from 'assets/images/accountly/illustrations/trade.png';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '');
};

const StatHalf = ({ tone, amount, loading }: { tone: 'get' | 'give'; amount: number; loading?: boolean }) => (
  <Box sx={{ flex: 1, minWidth: 0, p: 1.75, borderRadius: '16px', bgcolor: tone === 'get' ? '#EAF6F0' : '#FCEDED' }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconDot size={26} bg={tone === 'get' ? '#D6EEE2' : '#F8DEDE'} fg={tone === 'get' ? c.greenDeep : c.red}>
        <ArrowUp />
      </IconDot>
      <Typography sx={{ color: c.grey, fontSize: 13.5, fontWeight: 500 }} noWrap>
        {tone === 'get' ? "You'll Get" : "You'll Give"}
      </Typography>
    </Stack>
    {loading ? (
      <Skeleton variant="text" width={100} height={34} sx={{ mt: 1.25 }} />
    ) : (
      <Typography
        sx={{ mt: 1.25, fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', color: tone === 'get' ? c.greenDeep : c.redDeep }}
        noWrap
      >
        {formatAmount(amount)}
      </Typography>
    )}
  </Box>
);

const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <AppCard sx={{ overflow: 'hidden' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i}>
        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={20} />
            <Skeleton variant="text" width="30%" height={16} />
          </Box>
          <Skeleton variant="text" width={56} height={20} />
        </Stack>
      </Box>
    ))}
  </AppCard>
);

const EmptyBlock = ({ img, title, sub, cta, onCta }: { img: string; title: string; sub: string; cta?: string; onCta?: () => void }) => (
  <AppCard sx={{ px: 3, py: 4.5, textAlign: 'center' }}>
    <Box component="img" src={img} alt="" sx={{ width: 96, height: 96, objectFit: 'contain', mb: 1.75, opacity: 0.95 }} />
    <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: c.ink }}>{title}</Typography>
    <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5, maxWidth: 260, mx: 'auto', lineHeight: 1.5 }}>{sub}</Typography>
    {cta && (
      <Button variant="contained" onClick={onCta} startIcon={<UserPlus size={18} />} sx={{ mt: 2.5, px: 3.5 }}>
        {cta}
      </Button>
    )}
  </AppCard>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, recentCustomers, recentTransactions, hasLoaded } = useSelector((s) => s.dashboard);

  useEffect(() => {
    if (!hasLoaded) dispatch(fetchDashboardStatistics());
  }, [dispatch, hasLoaded]);

  const youWillGet = stats?.you_will_get ?? 0;
  const youWillGive = stats?.you_will_give ?? 0;
  const hasCustomers = recentCustomers && recentCustomers.length > 0;
  const hasTxns = recentTransactions && recentTransactions.length > 0;

  return (
    <>
      <AppHeader variant="home" />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2.25}>
          <Fade>
            <AppCard sx={{ p: 1.75 }}>
              <Stack direction="row" spacing={1.5}>
                <StatHalf tone="get" amount={youWillGet} loading={!hasLoaded} />
                <StatHalf tone="give" amount={youWillGive} loading={!hasLoaded} />
              </Stack>
              <Box
                component="button"
                onClick={() => navigate('/reports')}
                sx={{
                  mt: 1.5,
                  width: '100%',
                  py: 1.375,
                  border: `1px solid ${c.border}`,
                  borderRadius: '14px',
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  color: c.ink,
                  fontWeight: 600,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.875,
                  fontFamily: `'Inter', sans-serif`
                }}
              >
                <FileText size={14} color={c.grey} />
                View full report
                <ChevronRight size={13} color={c.greyLight} />
              </Box>
            </AppCard>
          </Fade>

          <Fade delay={0.05}>
            <Stack direction="row" spacing={1.5}>
              {[
                { label: 'Add Customer', sub: 'New contact', icon: <UserPlus />, to: '/customer/add' },
                { label: 'New Entry', sub: 'Record a payment', icon: <Zap />, to: '/transaction' }
              ].map((a) => (
                <MotionButton
                  key={a.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(a.to)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    p: 2,
                    borderRadius: '20px',
                    bgcolor: c.surface,
                    boxShadow: shadow.soft,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    textAlign: 'left'
                  }}
                >
                  <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                    {a.icon}
                  </IconDot>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: c.ink, letterSpacing: '-0.01em' }} noWrap>
                      {a.label}
                    </Typography>
                    <Typography sx={{ color: c.greyLight, fontSize: 11.5, fontWeight: 500, mt: 0.25 }} noWrap>
                      {a.sub}
                    </Typography>
                  </Box>
                </MotionButton>
              ))}
            </Stack>
          </Fade>

          <Fade delay={0.1}>
            <Box>
              <SectionHeader title="Customers" action="See all" onAction={() => navigate('/customer')} />
              {!hasLoaded ? (
                <ListSkeleton />
              ) : hasCustomers ? (
                <AppCard sx={{ overflow: 'hidden' }}>
                  {recentCustomers.map((cust, i) => {
                    const get = cust.balance < 0;
                    const av = avatarTint(cust.name);
                    return (
                      <Box key={cust._id}>
                        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                        <ListRow onClick={() => navigate(`/customer/${cust._id}`)}>
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
              ) : (
                <EmptyBlock
                  img={trade}
                  title="No customers yet"
                  sub="Add your first customer to start tracking who owes what."
                  cta="Add customer"
                  onCta={() => navigate('/customer/add')}
                />
              )}
            </Box>
          </Fade>

          <Fade delay={0.15}>
            <Box>
              <SectionHeader title="Recent Payments" action={hasTxns ? 'See all' : undefined} onAction={() => navigate('/transaction')} />
              {!hasLoaded ? (
                <ListSkeleton />
              ) : hasTxns ? (
                <AppCard sx={{ overflow: 'hidden' }}>
                  {recentTransactions.slice(0, 5).map((t, i) => {
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
                              {sent ? 'Paid to' : 'Received from'} {t.customerName}
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
              ) : (
                <EmptyBlock img={onlinePayment} title="No payments yet" sub="Open a customer and record a Send or Receive to see it here." />
              )}
            </Box>
          </Fade>
        </Stack>
      </Container>
    </>
  );
};

export default Dashboard;
