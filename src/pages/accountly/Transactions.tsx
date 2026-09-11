import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Divider, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchTransactions } from 'store/reducers/accountly/transactions';
import { formatAmount } from 'utils/accountly/format';
import { c, DISPLAY } from 'themes/accountly';
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
  const { transactions } = useSelector((s) => s.transactions);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchTransactions(undefined));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) => t.customerName?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || String(t.amount).includes(q)
    );
  }, [transactions, query]);

  return (
    <>
      <AppHeader variant="root" title="Payments" />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2}>
          {transactions.length > 0 && (
            <TextField
              fullWidth
              placeholder="Search payments"
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

          {filtered.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box component="img" src={onlinePayment} alt="" sx={{ width: 100, height: 100, objectFit: 'contain', mb: 1.75, opacity: 0.95 }} />
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
                {query ? 'No matches' : 'No payments yet'}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>
                Open a customer and record a Send or Receive.
              </Typography>
            </AppCard>
          ) : (
            <Fade>
              <AppCard sx={{ overflow: 'hidden' }}>
                {filtered.map((t, i) => {
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
            </Fade>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Transactions;
