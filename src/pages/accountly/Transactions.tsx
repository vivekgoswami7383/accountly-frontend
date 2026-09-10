import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, TextField } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'store';
import { fetchTransactions } from 'store/reducers/accountly/transactions';
import TransactionCard from 'components/accountly/TransactionCard';
import EmptyState from 'components/accountly/EmptyState';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

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
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        String(t.amount).includes(q) ||
        t.customerName?.toLowerCase().includes(q)
    );
  }, [transactions, query]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search transactions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          )
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          illustration={onlinePayment}
          title="Transactions Not Found"
          description="Go to a customer's details page to record transactions."
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
          {filtered.map((t) => (
            <TransactionCard key={t.id} transaction={t} onClick={() => navigate(`/transaction/${t.id}`)} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Transactions;
