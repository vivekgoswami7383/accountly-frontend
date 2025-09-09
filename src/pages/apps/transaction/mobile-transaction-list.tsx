import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Chip,
  Fab,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { customerAPI, transactionAPI } from 'services/api';
import AddTransaction from 'sections/apps/transaction/AddTransaction';

// ==============================|| MOBILE TRANSACTION LIST ||============================== //

const MobileTransactionList = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showMessage, setShowMessage] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      const customerData = response.data.data.customers || [];
      setCustomers(customerData);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      const transactionData = response.data.data.transactions || [];
      setTransactions(transactionData);
      setFilteredTransactions(transactionData);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setShowMessage('Error fetching transactions. Please try again.');
      setTimeout(() => setShowMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchTransactions();
  }, []);

  // Filter transactions based on search term and type
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((transaction) => transaction.type === filterType);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, transactions]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, transaction: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? <RiseOutlined /> : <FallOutlined />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
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
      {/* Search and Filter Bar */}
      <MainCard sx={{ mb: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              )
            }}
          />

          <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterChange} size="small" fullWidth>
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="credit">Received</ToggleButton>
            <ToggleButton value="debit">Paid</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </MainCard>

      {/* Transaction Cards */}
      <Stack spacing={2}>
        {filteredTransactions.map((transaction) => (
          <Card key={transaction._id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {/* Transaction Icon */}
                <Avatar
                  sx={{
                    width: 45,
                    height: 45,
                    bgcolor: transaction.type === 'credit' ? 'success.lighter' : 'error.lighter',
                    color: transaction.type === 'credit' ? 'success.main' : 'error.main'
                  }}
                >
                  {getTransactionIcon(transaction.type)}
                </Avatar>

                {/* Transaction Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {transaction.customer_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {transaction.description}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(transaction.date)}
                    </Typography>
                    <Chip label={transaction.status} size="small" color={getStatusColor(transaction.status)} variant="outlined" />
                  </Stack>
                </Box>

                {/* Amount and Actions */}
                <Stack alignItems="flex-end" spacing={1}>
                  <Typography variant="h6" color={transaction.type === 'credit' ? 'success.main' : 'error.main'} fontWeight="bold">
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </Typography>
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, transaction)}>
                    <MoreOutlined />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No transactions found' : 'No transactions yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try a different search term' : 'Record your first transaction to get started'}
          </Typography>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <EyeOutlined style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditOutlined style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteOutlined style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Transaction Dialog */}
      <AddTransaction
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={async (transactionData) => {
          try {
            await transactionAPI.create(transactionData);
            setAddDialogOpen(false);
            setShowMessage('Transaction added successfully!');
            fetchTransactions(); // Refresh the transaction list
            setTimeout(() => setShowMessage(''), 3000);
          } catch (err) {
            console.error('Error saving transaction:', err);
            setShowMessage('Error saving transaction. Please try again.');
            setTimeout(() => setShowMessage(''), 3000);
          }
        }}
        customers={customers}
      />

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
        onClick={() => setAddDialogOpen(true)}
      >
        <PlusOutlined />
      </Fab>
    </Box>
  );
};

export default MobileTransactionList;
