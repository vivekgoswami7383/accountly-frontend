import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { FileTextOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'store';
import {
  createTransaction,
  fetchTransactionById,
  updateTransactionById,
  deleteTransactionById
} from 'store/reducers/accountly/transactions';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import ScreenHeader from 'components/accountly/ScreenHeader';
import TransactionSuccessAnimation from 'components/accountly/TransactionSuccessAnimation';

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: transactionId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const customerId = params.get('customerId') || '';
  const type = params.get('type') === 'refund' ? 'refund' : 'payment';

  const { customers } = useSelector((s) => s.customers);
  const { selectedTransaction, loading } = useSelector((s) => s.transactions);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEdit = Boolean(transactionId);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (transactionId) dispatch(fetchTransactionById(transactionId));
  }, [dispatch, transactionId]);

  useEffect(() => {
    if (transactionId && selectedTransaction && selectedTransaction.id === transactionId) {
      setAmount(String(selectedTransaction.amount));
      setDescription(selectedTransaction.description || '');
    }
  }, [transactionId, selectedTransaction]);

  const customer = useMemo(() => {
    if (isEdit && selectedTransaction) {
      return { id: selectedTransaction.customerId, name: selectedTransaction.customerName };
    }
    const c = customers.find((x) => x.id === customerId);
    return c ? { id: c.id, name: c.name } : null;
  }, [isEdit, selectedTransaction, customers, customerId]);

  const transactionType: 'sent' | 'received' = isEdit
    ? selectedTransaction?.transaction_type || 'sent'
    : type === 'payment'
    ? 'sent'
    : 'received';

  const title = isEdit ? 'Edit Transaction' : transactionType === 'sent' ? 'Send Payment' : 'Receive Payment';
  const accentColor = transactionType === 'sent' ? 'error' : 'success';

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setAmountError(true);
      return;
    }
    if (!customer) {
      showSnackbar({ message: 'Customer not found', type: 'error' });
      return;
    }

    if (isEdit && transactionId) {
      const result = await dispatch(
        updateTransactionById({
          id: transactionId,
          data: { amount: value, description: description.trim() || undefined, transaction_type: transactionType }
        })
      );
      if (updateTransactionById.fulfilled.match(result)) navigate(-1);
      else showSnackbar({ message: (result.payload as string) || 'Failed to update transaction', type: 'error' });
      return;
    }

    if (!user?.business?._id) {
      showSnackbar({ message: 'Business information not found', type: 'error' });
      return;
    }
    const result = await dispatch(
      createTransaction({
        business: { _id: user.business._id, business_name: user.business.business_name || '' },
        customer: { _id: customer.id, name: customer.name },
        amount: value,
        transaction_type: transactionType,
        description: description.trim() || ''
      })
    );
    if (createTransaction.fulfilled.match(result)) setSuccess(true);
    else showSnackbar({ message: (result.payload as string) || 'Failed to record transaction', type: 'error' });
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!transactionId) return;
    const result = await dispatch(deleteTransactionById(transactionId));
    if (deleteTransactionById.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || 'Failed to delete transaction', type: 'error' });
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <ScreenHeader title={title} />

      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Amount
          </Typography>
          <TextField
            fullWidth
            autoFocus
            placeholder="Enter amount"
            value={amount}
            error={amountError}
            helperText={amountError ? 'Enter a valid amount' : ' '}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.]/g, ''));
              setAmountError(false);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <FileTextOutlined />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {isEdit ? (
          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<DeleteOutlined />}
              disabled={loading}
              onClick={() => setConfirmDelete(true)}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Delete
            </Button>
            <Button fullWidth variant="contained" disabled={loading} onClick={handleSubmit} sx={{ borderRadius: 2, py: 1.5 }}>
              {loading ? 'Processing…' : 'Update'}
            </Button>
          </Stack>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color={accentColor}
            disabled={loading}
            onClick={handleSubmit}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {loading ? 'Processing…' : 'Save'}
          </Button>
        )}
      </Stack>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>
          <WarningOutlined style={{ color: '#FF3B30', marginRight: 8 }} />
          Delete Transaction
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this transaction? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <TransactionSuccessAnimation visible={success} onComplete={() => navigate(-1)} />
    </Box>
  );
};

export default Payment;
