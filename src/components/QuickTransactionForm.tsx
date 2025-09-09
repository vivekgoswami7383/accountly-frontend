import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { CloseOutlined, SearchOutlined, RiseOutlined, FallOutlined, FileTextOutlined } from '@ant-design/icons';

interface QuickTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
}

const QuickTransactionForm = ({ open, onClose, onSave }: QuickTransactionFormProps) => {
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!amount || !customer) return;

    const transaction = {
      type: transactionType,
      amount: parseFloat(amount),
      customer,
      description: description || `${transactionType === 'credit' ? 'Payment received from' : 'Payment made to'} ${customer}`,
      date: new Date().toISOString()
    };

    onSave(transaction);
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setCustomer('');
    setDescription('');
    setTransactionType('credit');
    onClose();
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Quick Transaction
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Transaction Type */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Type
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={transactionType === 'credit' ? 'contained' : 'outlined'}
                color="success"
                startIcon={<RiseOutlined />}
                onClick={() => setTransactionType('credit')}
                sx={{ flex: 1 }}
              >
                Receive Money
              </Button>
              <Button
                variant={transactionType === 'debit' ? 'contained' : 'outlined'}
                color="error"
                startIcon={<FallOutlined />}
                onClick={() => setTransactionType('debit')}
                sx={{ flex: 1 }}
              >
                Pay Money
              </Button>
            </Stack>
          </Box>

          {/* Customer Search */}
          <TextField
            fullWidth
            label="Customer"
            placeholder="Search or select customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              )
            }}
          />

          {/* Amount */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Amount
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
              sx={{ mb: 2 }}
            />

            {/* Quick Amount Buttons */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quickAmounts.map((quickAmount) => (
                <Chip
                  key={quickAmount}
                  label={`₹${quickAmount}`}
                  onClick={() => setAmount(quickAmount.toString())}
                  variant={amount === quickAmount.toString() ? 'filled' : 'outlined'}
                  color="primary"
                />
              ))}
            </Stack>
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            label="Description (Optional)"
            placeholder="Add a note about this transaction"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />

          {/* Transaction Summary */}
          {amount && customer && (
            <>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Transaction Summary
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {transactionType === 'credit' ? 'Receiving' : 'Paying'} ₹{amount} {transactionType === 'credit' ? 'from' : 'to'}{' '}
                    {customer}
                  </Typography>
                  <Chip
                    icon={transactionType === 'credit' ? <RiseOutlined /> : <FallOutlined />}
                    label={transactionType === 'credit' ? 'Credit' : 'Debit'}
                    color={transactionType === 'credit' ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!amount || !customer} startIcon={<FileTextOutlined />}>
          Record Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickTransactionForm;
