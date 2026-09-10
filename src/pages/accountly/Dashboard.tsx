import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Divider, Stack, Typography, alpha, useTheme } from '@mui/material';
import { UserAddOutlined, PhoneOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { fetchDashboardStatistics } from 'store/reducers/accountly/dashboard';
import CustomerAvatar from 'components/accountly/CustomerAvatar';
import TransactionCard from 'components/accountly/TransactionCard';
import EmptyState from 'components/accountly/EmptyState';
import { formatAmount, balanceLabel } from 'utils/accountly/format';
import trade from 'assets/images/accountly/illustrations/trade.png';

const SectionHeader = ({ title, onSeeMore }: { title: string; onSeeMore: () => void }) => (
  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
    <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
      {title}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      onClick={onSeeMore}
      sx={{ cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      See More
    </Typography>
  </Stack>
);

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers } = useSelector((s) => s.customers);
  const { recentCustomers, recentTransactions } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStatistics());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const youWillGet = customers.filter((c) => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const youWillGive = customers.filter((c) => c.balance > 0).reduce((sum, c) => sum + c.balance, 0);

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: '100%' }}>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="success.main" noWrap>
                {formatAmount(youWillGet)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You Will Get
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="error.main" noWrap>
                {formatAmount(youWillGive)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You Will Give
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, width: '100%' }}>
        <Box sx={{ minWidth: 0 }}>
          {recentCustomers && recentCustomers.length > 0 ? (
            <>
              <SectionHeader title="Recent Customers" onSeeMore={() => navigate('/customer')} />
              <Stack spacing={1.5}>
                {recentCustomers.map((c) => (
                  <Card
                    key={c._id}
                    onClick={() => navigate(`/customer/${c._id}`)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
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
                      <Typography variant="caption" color={c.balance < 0 ? 'success.main' : 'error.main'} noWrap>
                        {balanceLabel(c.balance)}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </>
          ) : (
            <EmptyState
              illustration={trade}
              title="Customers Not Found"
              description="Add your first customer to get started"
              actionLabel="Add Customer"
              actionIcon={<UserAddOutlined />}
              onAction={() => navigate('/customer/add')}
            />
          )}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          {recentTransactions && recentTransactions.length > 0 && (
            <>
              <SectionHeader title="Recent Transactions" onSeeMore={() => navigate('/transaction')} />
              <Stack spacing={1.5}>
                {recentTransactions.slice(0, 5).map((t) => (
                  <TransactionCard key={t.id} transaction={t} onClick={() => navigate(`/transaction/${t.id}`)} />
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default Dashboard;
