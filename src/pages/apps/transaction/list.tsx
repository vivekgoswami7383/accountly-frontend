import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import AddTransaction from 'sections/apps/transaction/AddTransaction';
import AlertTransactionDelete from 'sections/apps/transaction/AlertTransactionDelete';
import { transactionAPI, customerAPI } from 'services/api';
import { SearchOutlined, PlusOutlined, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';

const TransactionList = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Cash';
      case 'upi':
        return 'UPI';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getAll();
      const transactionData = response.data.data?.transactions || [];
      setTransactions(transactionData);
      setFilteredTransactions(transactionData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data.customers || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
    }
  };

  // Filter transactions based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(
        (transaction) =>
          transaction.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.customer?.phone?.includes(searchTerm) ||
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  // Load data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchCustomers();
  }, []);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setAddDialogOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setAddDialogOpen(true);
  };

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      setLoading(true);
      if (editingTransaction) {
        // Update existing transaction
        await transactionAPI.update(editingTransaction._id, transactionData);
      } else {
        // Add new transaction
        await transactionAPI.create(transactionData);
      }
      // Refresh the list
      await fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
      console.error('Error saving transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = (transaction: any) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (confirmed: boolean) => {
    setDeleteDialogOpen(false);

    if (confirmed && transactionToDelete) {
      try {
        setLoading(true);
        await transactionAPI.delete(transactionToDelete._id);
        await fetchTransactions();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete transaction');
        console.error('Error deleting transaction:', err);
      } finally {
        setLoading(false);
      }
    }

    setTransactionToDelete(null);
  };

  return (
    <MainCard content={false}>
      <ScrollX>
        <Stack spacing={3}>
          {/* Header with Search and Actions */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 3, pb: 0 }}
          >
            <TextField
              placeholder={`Search ${filteredTransactions.length} records...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 250 }}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAddTransaction} size="small">
                Add Transaction
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mx: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const balance = transaction.amount - transaction.paid_amount;
                  return (
                    <TableRow key={transaction._id} hover>
                      <TableCell>
                        <Stack spacing={0}>
                          <Typography variant="subtitle1">
                            {transaction.customer?.first_name} {transaction.customer?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.customer?.phone}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTypeLabel(transaction.type)}
                          color={transaction.type === 'upi' ? 'primary' : 'default'}
                          size="small"
                          variant="light"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">{formatCurrency(transaction.amount)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">{formatCurrency(transaction.paid_amount)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color={balance > 0 ? 'error.main' : 'success.main'}>
                          {formatCurrency(balance)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{transaction.description || 'No description'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={transaction.status} color={getStatusColor(transaction.status) as any} size="small" variant="light" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(transaction.due_date).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
                          <Tooltip title="Edit">
                            <IconButton color="primary" size="small" onClick={() => handleEditTransaction(transaction)}>
                              <EditTwoTone />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" size="small" onClick={() => handleDeleteTransaction(transaction)}>
                              <DeleteTwoTone />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </ScrollX>

      <AddTransaction
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        isEdit={!!editingTransaction}
        customers={customers}
      />

      <AlertTransactionDelete
        title={`Transaction #${transactionToDelete?._id?.slice(-6) || ''}`}
        open={deleteDialogOpen}
        handleClose={handleDeleteConfirm}
      />
    </MainCard>
  );
};

export default TransactionList;
