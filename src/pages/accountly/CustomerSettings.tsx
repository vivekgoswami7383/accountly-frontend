import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { EditOutlined, DeleteOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers, deleteCustomer } from 'store/reducers/accountly/customers';
import useSnackbar from 'hooks/useSnackbar';
import ScreenHeader from 'components/accountly/ScreenHeader';
import CustomerAvatar from 'components/accountly/CustomerAvatar';
import { formatAmount } from 'utils/accountly/format';

const CustomerSettings = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const { customers } = useSelector((s) => s.customers);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const customer = customers.find((c) => c.id === id);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  const handleDelete = async () => {
    setConfirmOpen(false);
    const result = await dispatch(deleteCustomer(id));
    if (deleteCustomer.fulfilled.match(result)) {
      navigate('/customer');
    } else {
      showSnackbar({ message: (result.payload as string) || 'Failed to delete customer', type: 'error' });
    }
  };

  if (!customer) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <ScreenHeader title="Customer Settings" />
        <Typography color="text.secondary">Customer not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <ScreenHeader>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CustomerAvatar name={customer.name} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {customer.phone}
            </Typography>
          </Box>
        </Stack>
      </ScreenHeader>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Customer Information
      </Typography>
      <Card sx={{ borderRadius: 3, p: 2, mb: 3 }}>
        {[
          ['Name', customer.name],
          ['Phone', customer.phone],
          ['Balance', formatAmount(customer.balance)]
        ].map(([label, value], i, arr) => (
          <Box key={label as string}>
            <Stack direction="row" justifyContent="space-between" sx={{ py: 1.25 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography
                fontWeight={600}
                color={label === 'Balance' ? (customer.balance < 0 ? 'success.main' : 'error.main') : 'text.primary'}
              >
                {value}
              </Typography>
            </Stack>
            {i < arr.length - 1 && <Divider />}
          </Box>
        ))}
      </Card>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Actions
      </Typography>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <List disablePadding>
          <ListItemButton onClick={() => navigate(`/customer/${id}/edit`)}>
            <ListItemIcon sx={{ color: 'primary.main' }}>
              <EditOutlined />
            </ListItemIcon>
            <ListItemText primary="Edit Customer" secondary="Update customer information" />
            <RightOutlined style={{ opacity: 0.5 }} />
          </ListItemButton>
        </List>
      </Card>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Danger Zone
      </Typography>
      <Card sx={{ borderRadius: 3 }}>
        <List disablePadding>
          <ListItemButton onClick={() => setConfirmOpen(true)}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <DeleteOutlined />
            </ListItemIcon>
            <ListItemText
              primary={<Typography color="error.main">Delete Customer</Typography>}
              secondary="Permanently remove customer"
            />
            <RightOutlined style={{ opacity: 0.5 }} />
          </ListItemButton>
        </List>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <WarningOutlined style={{ color: '#FF3B30', marginRight: 8 }} />
          Delete Customer
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {customer.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerSettings;
