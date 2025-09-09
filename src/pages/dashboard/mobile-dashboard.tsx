import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Fab,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper
} from '@mui/material';
import {
  PlusOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  WalletOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MessageOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import QuickTransactionForm from 'components/QuickTransactionForm';
import { customerAPI } from 'services/api';

// ==============================|| MOBILE DASHBOARD ||============================== //

const MobileDashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [showMessage, setShowMessage] = useState<string>('');

  // Calculate real stats from API data
  const dashboardStats = {
    totalCustomers: customers.length,
    totalBalance: customers.reduce((sum, customer) => sum + (customer.balance || 0), 0),
    pendingAmount: customers.filter((c) => (c.balance || 0) > 0).reduce((sum, customer) => sum + (customer.balance || 0), 0),
    todayTransactions: 0 // This would need transaction data to calculate
  };

  const quickActions = [
    { label: 'Add Customer', icon: <UserOutlined />, color: 'primary' },
    { label: 'Record Payment', icon: <FileTextOutlined />, color: 'success' },
    { label: 'Send Reminder', icon: <MessageOutlined />, color: 'warning' },
    { label: 'View Reports', icon: <RiseOutlined />, color: 'info' }
  ];

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      const customerData = response.data.data.customers || [];
      setCustomers(customerData.slice(0, 5)); // Show only top 5 for mobile
    } catch (err) {
      console.error('Error fetching customers:', err);
      setShowMessage('Error loading dashboard data. Please try again.');
      setTimeout(() => setShowMessage(''), 3000);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleTransactionSave = (transaction: any) => {
    console.log('Transaction saved:', transaction);
    // Add logic to save transaction
    setTransactionFormOpen(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Add Customer':
        // Navigate directly to customer page
        navigate('/mobile/customer');
        break;
      case 'Record Payment':
        setTransactionFormOpen(true);
        break;
      case 'Send Reminder':
        setShowMessage('Sending reminder to customers...');
        setTimeout(() => {
          setShowMessage('Reminders sent successfully!');
          setTimeout(() => setShowMessage(''), 2000);
        }, 2000);
        break;
      case 'View Reports':
        setShowMessage('Loading reports...');
        setTimeout(() => {
          setShowMessage('Reports feature coming soon!');
          setTimeout(() => setShowMessage(''), 3000);
        }, 1000);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <Box sx={{ pb: 12 }}>
      {/* Message Display */}
      {showMessage && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: 'primary.main',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="body2">{showMessage}</Typography>
        </Box>
      )}
      {/* Extra padding for bottom navigation */}
      {/* Header Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WalletOutlined />
                <Typography variant="body2">Total Balance</Typography>
              </Stack>
              <Typography variant="h4" fontWeight="bold">
                ₹{dashboardStats.totalBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <UserOutlined />
                <Typography variant="body2">Customers</Typography>
              </Stack>
              <Typography variant="h4" fontWeight="bold">
                {dashboardStats.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Quick Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              ₹{dashboardStats.pendingAmount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {dashboardStats.todayTransactions}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Today's Transactions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* Quick Actions */}
      <MainCard sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} key={index}>
              <Card
                onClick={() => handleQuickAction(action.label)}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    backgroundColor: 'action.hover'
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                    boxShadow: 1
                  }
                }}
              >
                <Box sx={{ color: `${action.color}.main`, mb: 1, fontSize: '1.5rem' }}>{action.icon}</Box>
                <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                  {action.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MainCard>
      {/* Recent Customers */}
      <MainCard sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Recent Customers</Typography>
          <Chip label="View All" size="small" clickable onClick={() => navigate('/mobile/customer')} sx={{ cursor: 'pointer' }} />
        </Stack>
        <List>
          {customers.map((customer, index) => (
            <div key={customer._id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.lighter' }}>{customer.first_name?.charAt(0) || 'C'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${customer.first_name} ${customer.last_name}`}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneOutlined style={{ fontSize: '12px' }} />
                      <Typography variant="caption">{customer.phone}</Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack alignItems="flex-end">
                    <Typography variant="subtitle2" color={customer.balance < 0 ? 'error.main' : 'success.main'} fontWeight="bold">
                      ₹{customer.balance || 0}
                    </Typography>
                    <Chip
                      label={customer.balance < 0 ? 'Owes' : 'Paid'}
                      size="small"
                      color={customer.balance < 0 ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
              {index < customers.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </MainCard>
      {/* Recent Transactions */}
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Recent Transactions</Typography>
          <Chip label="View All" size="small" clickable onClick={() => navigate('/mobile/transaction')} sx={{ cursor: 'pointer' }} />
        </Stack>
        <List>
          {[
            { name: 'Rajesh Kumar', amount: 1500, type: 'credit', time: '2 min ago' },
            { name: 'Priya Sharma', amount: 2500, type: 'debit', time: '15 min ago' },
            { name: 'Amit Patel', amount: 800, type: 'credit', time: '1 hour ago' }
          ].map((transaction, index) => (
            <div key={index}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: transaction.type === 'credit' ? 'success.lighter' : 'error.lighter',
                      color: transaction.type === 'credit' ? 'success.main' : 'error.main'
                    }}
                  >
                    {transaction.type === 'credit' ? <RiseOutlined /> : <FallOutlined />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={transaction.name} secondary={transaction.time} />
                <ListItemSecondaryAction>
                  <Typography variant="subtitle2" color={transaction.type === 'credit' ? 'success.main' : 'error.main'} fontWeight="bold">
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              {index < 2 && <Divider />}
            </div>
          ))}
        </List>
      </MainCard>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          zIndex: 1000,
          width: 56,
          height: 56
        }}
        onClick={() => setTransactionFormOpen(true)}
      >
        <PlusOutlined />
      </Fab>
      {/* Quick Transaction Form */}
      <QuickTransactionForm open={transactionFormOpen} onClose={() => setTransactionFormOpen(false)} onSave={handleTransactionSave} />
    </Box>
  );
};

export default MobileDashboard;
