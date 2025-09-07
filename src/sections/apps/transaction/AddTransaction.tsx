import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete
} from '@mui/material';

interface AddTransactionProps {
  open: boolean;
  onClose: () => void;
  onSave: (transactionData: any) => void;
  transaction?: any;
  isEdit?: boolean;
  customers?: any[];
}

const AddTransaction = ({ open, onClose, onSave, transaction, isEdit = false, customers = [] }: AddTransactionProps) => {
  const [formData, setFormData] = useState({
    customer_id: transaction?.customer_id || '',
    type: transaction?.type || 'cash',
    amount: transaction?.amount || '',
    paid_amount: transaction?.paid_amount || '',
    description: transaction?.description || '',
    due_date: transaction?.due_date || '',
    status: transaction?.status || 'pending',
    ...transaction
  });

  const handleChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleCustomerChange = (event: any, value: any) => {
    setFormData({
      ...formData,
      customer_id: value?.id || ''
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} - ${option.phone}`}
                value={customers.find((c) => c.id === formData.customer_id) || null}
                onChange={handleCustomerChange}
                renderInput={(params) => <TextField {...params} label="Select Customer" required />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select value={formData.type} onChange={handleChange('type')} label="Payment Type">
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} onChange={handleChange('status')} label="Status">
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Total Amount" type="number" value={formData.amount} onChange={handleChange('amount')} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Paid Amount"
                type="number"
                value={formData.paid_amount}
                onChange={handleChange('paid_amount')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={handleChange('due_date')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTransaction;
