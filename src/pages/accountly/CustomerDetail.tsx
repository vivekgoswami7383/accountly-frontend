import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  PhoneOutlined,
  MoreOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { fetchCustomerTransactions } from 'store/reducers/accountly/transactions';
import CustomerAvatar from 'components/accountly/CustomerAvatar';
import TransactionCard from 'components/accountly/TransactionCard';
import EmptyState from 'components/accountly/EmptyState';
import { formatAmount, balanceLabel } from 'utils/accountly/format';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

const CustomerDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { customers } = useSelector((s) => s.customers);
  const { transactions, customerStats } = useSelector((s) => s.transactions);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const customer = customers.find((c) => c.id === id);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (id) dispatch(fetchCustomerTransactions(id));
  }, [dispatch, id]);

  const balance = customerStats.customerBalance ?? customer?.balance ?? 0;

  return (
    <Box sx={{ pb: { xs: 'calc(92px + env(safe-area-inset-bottom, 0px))', md: 2 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ ml: -1 }}>
          <ArrowLeftOutlined />
        </IconButton>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => navigate(`/customer/${id}/settings`)}
        >
          <CustomerAvatar name={customer?.name || 'Customer'} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {customer?.name || 'Customer'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {customer?.phone || ''}
            </Typography>
          </Box>
        </Stack>
        {customer?.phone && (
          <IconButton component="a" href={`tel:${customer.phone}`}>
            <PhoneOutlined />
          </IconButton>
        )}
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreOutlined />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              navigate(`/customer/${id}/settings`);
            }}
          >
            <SettingOutlined style={{ marginRight: 8 }} /> Settings
          </MenuItem>
        </Menu>
      </Stack>

      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center">
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} color={balance < 0 ? 'success.main' : 'error.main'}>
                {formatAmount(balance)}
              </Typography>
              <Typography variant="caption" color={balance < 0 ? 'success.main' : 'error.main'}>
                {balanceLabel(balance)}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {transactions.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Transactions
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {transactions.length > 0 ? (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Recent Transactions
          </Typography>
          <Stack spacing={1.5}>
            {transactions.map((t) => (
              <TransactionCard key={t.id} transaction={t} onClick={() => navigate(`/transaction/${t.id}`)} />
            ))}
          </Stack>
        </>
      ) : (
        <EmptyState
          illustration={onlinePayment}
          title="Transactions Not Found"
          description="Record a Send or Receive payment to get started."
        />
      )}

      <Box
        sx={{
          position: isDesktop ? 'static' : 'fixed',
          bottom: isDesktop ? 'auto' : 'calc(16px + env(safe-area-inset-bottom, 0px))',
          left: 16,
          right: 16,
          mt: isDesktop ? 3 : 0,
          maxWidth: isDesktop ? 480 : 'none'
        }}
      >
        <Divider sx={{ mb: 2, display: isDesktop ? 'none' : 'block' }} />
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<ArrowUpOutlined />}
            onClick={() => navigate(`/transaction/new?customerId=${id}&type=payment`)}
            sx={{ borderRadius: 2, py: 1.25 }}
          >
            Send
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<ArrowDownOutlined />}
            onClick={() => navigate(`/transaction/new?customerId=${id}&type=refund`)}
            sx={{ borderRadius: 2, py: 1.25 }}
          >
            Receive
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CustomerDetail;
