import { ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Divider, Skeleton, Stack, Typography, alpha } from '@mui/material';
import { ArrowUp, ArrowDown, UserPlus, Zap, FileText, ChevronRight, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchDashboardStatistics } from 'store/reducers/accountly/dashboard';
import { useFormatAmount, formatPhone } from 'utils/accountly/format';
import { DISPLAY, shadow, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BalanceTag, Fade, IconDot, ListRow, MotionButton, SectionHeader } from 'components/accountly/kit';
import { CustomersEmptyIllustration, TransactionsEmptyIllustration } from 'components/accountly/EmptyIllustration';

const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '');
};

const StatHalf = ({ tone, amount, loading, label }: { tone: 'get' | 'give'; amount: number; loading?: boolean; label: string }) => {
  const c = useAccountlyColors();
  const fmt = useFormatAmount();
  return (
    <Box sx={{ flex: 1, minWidth: 0, p: 1.75, borderRadius: '16px', bgcolor: tone === 'get' ? c.greenSoft : c.redSoft }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <IconDot size={26} bg={alpha(tone === 'get' ? c.green : c.red, 0.22)} fg={tone === 'get' ? c.greenDeep : c.red}>
          <ArrowUp />
        </IconDot>
        <Typography sx={{ flex: 1, minWidth: 0, color: c.grey, fontSize: 13.5, fontWeight: 500, lineHeight: 1.3 }}>
          {label}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton variant="text" width={100} height={34} sx={{ mt: 1.25 }} />
      ) : (
        <Typography
          sx={{ mt: 1.25, fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, letterSpacing: '-0.02em', color: tone === 'get' ? c.greenDeep : c.redDeep }}
          noWrap
        >
          {fmt(amount)}
        </Typography>
      )}
    </Box>
  );
};

const ListSkeleton = ({ rows = 3 }: { rows?: number }) => {
  const c = useAccountlyColors();
  return (
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
};

const EmptyBlock = ({ img, title, sub, cta, onCta }: { img: ReactNode; title: string; sub: string; cta?: string; onCta?: () => void }) => {
  const c = useAccountlyColors();
  return (
    <AppCard sx={{ px: 3, py: 4.5, textAlign: 'center' }}>
      <Box sx={{ mb: 1.75 }}>{img}</Box>
      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16, color: c.ink }}>{title}</Typography>
      <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5, maxWidth: 260, mx: 'auto', lineHeight: 1.5 }}>{sub}</Typography>
      {cta && (
        <Button variant="contained" onClick={onCta} startIcon={<UserPlus size={18} />} sx={{ mt: 2.5, px: 3.5 }}>
          {cta}
        </Button>
      )}
    </AppCard>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { stats, recentCustomers, recentTransactions, hasLoaded } = useSelector((s) => s.dashboard);
  const skipEnterRef = useRef(hasLoaded);

  useEffect(() => {
    if (!hasLoaded) dispatch(fetchDashboardStatistics());
  }, [dispatch, hasLoaded]);

  const receivable = stats?.receivable ?? 0;
  const payable = stats?.payable ?? 0;
  const hasCustomers = recentCustomers && recentCustomers.length > 0;
  const hasTxns = recentTransactions && recentTransactions.length > 0;

  return (
    <>
      <AppHeader variant="home" />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2.25}>
          <Fade skipEnter={skipEnterRef.current}>
            <AppCard sx={{ p: 1.75 }}>
              <Stack direction="row" spacing={1.5}>
                <StatHalf tone="give" amount={payable} loading={!hasLoaded} label={t('home.youllGive')} />
                <StatHalf tone="get" amount={receivable} loading={!hasLoaded} label={t('home.youllGet')} />
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
                  fontWeight: 500,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.875,
                  fontFamily: DISPLAY
                }}
              >
                <FileText size={14} color={c.grey} />
                {t('home.viewFullReport')}
                <ChevronRight size={13} color={c.greyLight} />
              </Box>
            </AppCard>
          </Fade>

          <Fade delay={0.05} skipEnter={skipEnterRef.current}>
            <Stack direction="row" spacing={1.5}>
              {[
                { label: t('home.addCustomer'), sub: t('home.newContact'), icon: <UserPlus />, to: '/customer/add' },
                { label: t('home.newEntry'), sub: t('home.recordPayment'), icon: <Zap />, to: '/customer' }
              ].map((a) => (
                <MotionButton
                  key={a.to}
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
                    <Typography sx={{ fontWeight: 500, fontSize: 14, lineHeight: 1.2, color: c.ink, letterSpacing: '-0.01em' }} noWrap>
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

          <Fade delay={0.1} skipEnter={skipEnterRef.current}>
            <Box>
              <SectionHeader title={t('home.customers')} action={t('common.seeAll')} onAction={() => navigate('/customer')} />
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
                            sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 500, fontSize: 14, flexShrink: 0 }}
                          >
                            {initials(cust.name)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                              {cust.name}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0, mt: 0.25 }}>
                              <Phone size={12} color={c.greyLight} style={{ flexShrink: 0 }} />
                              <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                                {formatPhone(cust.phone)}
                              </Typography>
                            </Stack>
                          </Box>
                          <Stack alignItems="center" spacing={0.375} sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: get ? c.greenDeep : c.redDeep }} noWrap>
                              {fmt(cust.balance)}
                            </Typography>
                            <BalanceTag tone={get ? 'get' : 'give'} sx={{ alignSelf: 'center' }}>
                              {get ? t('home.youllGet') : t('home.youllGive')}
                            </BalanceTag>
                          </Stack>
                          <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                        </ListRow>
                      </Box>
                    );
                  })}
                </AppCard>
              ) : (
                <EmptyBlock
                  img={<CustomersEmptyIllustration />}
                  title={t('home.noCustomersYet')}
                  sub={t('home.noCustomersSub')}
                  cta={t('home.addCustomerCta')}
                  onCta={() => navigate('/customer/add')}
                />
              )}
            </Box>
          </Fade>

          <Fade delay={0.15} skipEnter={skipEnterRef.current}>
            <Box>
              <SectionHeader title={t('home.recentPayments')} action={hasTxns ? t('common.seeAll') : undefined} onAction={() => navigate('/transaction')} />
              {!hasLoaded ? (
                <ListSkeleton />
              ) : hasTxns ? (
                <AppCard sx={{ overflow: 'hidden' }}>
                  {recentTransactions.slice(0, 5).map((t2, i) => {
                    const sent = t2.transaction_type === 'debit';
                    return (
                      <Box key={t2.id}>
                        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                        <ListRow onClick={() => navigate(`/transaction/${t2.id}`)}>
                          <IconDot size={44} bg={sent ? c.redSoft : c.greenSoft} fg={sent ? c.redDeep : c.greenDeep}>
                            {sent ? <ArrowUp /> : <ArrowDown />}
                          </IconDot>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                              {sent ? t('home.paidTo', { name: t2.customerName }) : t('home.receivedFrom', { name: t2.customerName })}
                            </Typography>
                            <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                              {fmtWhen(t2.createdAt)}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 500, fontSize: 14.5, flexShrink: 0, alignSelf: 'flex-start', color: sent ? c.redDeep : c.greenDeep }} noWrap>
                            {fmt(t2.amount)}
                          </Typography>
                        </ListRow>
                      </Box>
                    );
                  })}
                </AppCard>
              ) : (
                <EmptyBlock img={<TransactionsEmptyIllustration />} title={t('home.noPaymentsYet')} sub={t('home.noPaymentsSub')} />
              )}
            </Box>
          </Fade>
        </Stack>
      </Container>
    </>
  );
};

export default Dashboard;
