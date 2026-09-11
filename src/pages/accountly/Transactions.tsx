import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Divider, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchTransactions } from 'store/reducers/accountly/transactions';
import { useFormatAmount } from 'utils/accountly/format';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, ListRow, IconDot } from 'components/accountly/kit';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '');
};

const Transactions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { transactions, hasLoadedGlobal } = useSelector((s) => s.transactions);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!hasLoadedGlobal) dispatch(fetchTransactions(undefined));
  }, [dispatch, hasLoadedGlobal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (tx) => tx.customerName?.toLowerCase().includes(q) || tx.description?.toLowerCase().includes(q) || String(tx.amount).includes(q)
    );
  }, [transactions, query]);

  return (
    <>
      <AppHeader variant="root" title={t('transactions.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2}>
          {transactions.length > 0 && (
            <TextField
              fullWidth
              placeholder={t('transactions.searchPayments')}
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

          {!hasLoadedGlobal ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2, 3].map((i) => (
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
          ) : filtered.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box component="img" src={onlinePayment} alt="" sx={{ width: 100, height: 100, objectFit: 'contain', mb: 1.75, opacity: 0.95 }} />
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
                {query ? t('customers.noMatches') : t('home.noPaymentsYet')}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('transactions.openCustomerRecord')}</Typography>
            </AppCard>
          ) : (
            <Fade>
              <AppCard sx={{ overflow: 'hidden' }}>
                {filtered.map((tx, i) => {
                  const sent = tx.transaction_type === 'debit';
                  return (
                    <Box key={tx.id}>
                      {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                      <ListRow onClick={() => navigate(`/transaction/${tx.id}`)}>
                        <IconDot size={44} bg={sent ? c.redSoft : c.greenSoft} fg={sent ? c.redDeep : c.greenDeep}>
                          {sent ? <ArrowUp /> : <ArrowDown />}
                        </IconDot>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: c.ink }} noWrap>
                            {sent ? t('home.paidTo', { name: tx.customerName }) : t('home.receivedFrom', { name: tx.customerName })}
                          </Typography>
                          <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                            {fmtWhen(tx.createdAt)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 14.5, flexShrink: 0, color: sent ? c.redDeep : c.greenDeep }} noWrap>
                          {sent ? '−' : '+'}
                          {fmt(tx.amount)}
                        </Typography>
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

export default Transactions;
