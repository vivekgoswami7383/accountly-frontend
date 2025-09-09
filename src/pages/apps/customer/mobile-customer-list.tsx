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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  PhoneOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { customerAPI } from 'services/api';
import AddCustomerSimple from 'sections/apps/customer/AddCustomerSimple';
import useAuth from 'hooks/useAuth';

// ==============================|| MOBILE CUSTOMER LIST ||============================== //

const MobileCustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showMessage, setShowMessage] = useState<string>('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      const customerData = response.data.data.customers || [];
      setCustomers(customerData);
      setFilteredCustomers(customerData);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setShowMessage('Error fetching customers. Please try again.');
      setTimeout(() => setShowMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        (customer) =>
          customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, customer: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        await customerAPI.delete(selectedCustomer._id);
        await fetchCustomers();
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
    setDeleteDialogOpen(false);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'success.main';
    if (balance < 0) return 'error.main';
    return 'text.secondary';
  };

  const getBalanceLabel = (balance: number) => {
    if (balance > 0) return 'Paid';
    if (balance < 0) return 'Owes';
    return 'Settled';
  };

  const getBalanceChipColor = (balance: number) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'error';
    return 'default';
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
      {/* Search Bar */}
      <MainCard sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search customers..."
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
      </MainCard>

      {/* Customer Cards */}
      <Stack spacing={2}>
        {filteredCustomers.map((customer) => (
          <Card key={customer._id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: 'primary.lighter',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {customer.first_name?.charAt(0) || 'C'}
                </Avatar>

                {/* Customer Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {customer.first_name} {customer.last_name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <PhoneOutlined style={{ fontSize: '12px', color: '#666' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {customer.phone}
                    </Typography>
                  </Stack>
                  {customer.email && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {customer.email}
                    </Typography>
                  )}
                </Box>

                {/* Balance and Actions */}
                <Stack alignItems="flex-end" spacing={1}>
                  <Typography variant="h6" color={getBalanceColor(customer.balance)} fontWeight="bold">
                    ₹{Math.abs(customer.balance || 0)}
                  </Typography>
                  <Chip
                    label={getBalanceLabel(customer.balance)}
                    size="small"
                    color={getBalanceChipColor(customer.balance)}
                    variant="outlined"
                  />
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, customer)}>
                    <MoreOutlined />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Quick Actions Row */}
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<RiseOutlined />}
                    variant="outlined"
                    color="success"
                    onClick={() => {
                      setShowMessage(`Opening receive payment for ${customer.first_name}...`);
                      setTimeout(() => setShowMessage(''), 2000);
                    }}
                  >
                    Receive
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<FallOutlined />}
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setShowMessage(`Opening pay to ${customer.first_name}...`);
                      setTimeout(() => setShowMessage(''), 2000);
                    }}
                  >
                    Pay
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<MessageOutlined />}
                    variant="outlined"
                    color="info"
                    onClick={() => {
                      setShowMessage(`Sending message to ${customer.first_name}...`);
                      setTimeout(() => setShowMessage(''), 2000);
                    }}
                  >
                    Message
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Empty State */}
      {!loading && filteredCustomers.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No customers found' : 'No customers yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try a different search term' : 'Add your first customer to get started'}
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
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteOutlined style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCustomer?.first_name} {selectedCustomer?.last_name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <AddCustomerSimple
        open={addDialogOpen}
        onCancel={() => setAddDialogOpen(false)}
        onSave={async (customerData) => {
          try {
            // Combine country code with phone number
            const fullPhoneNumber = `${customerData.country_code || '+91'}${customerData.phone}`;
            const customerPayload = {
              first_name: customerData.first_name,
              last_name: customerData.last_name,
              phone: fullPhoneNumber,
              address: customerData.address,
              balance: customerData.balance,
              business: {
                _id: user?.business?._id || '',
                business_name: user?.business?.business_name || ''
              }
            };

            await customerAPI.create(customerPayload);
            setAddDialogOpen(false);
            setShowMessage('Customer added successfully!');
            fetchCustomers(); // Refresh the customer list
            setTimeout(() => setShowMessage(''), 3000);
          } catch (err) {
            console.error('Error saving customer:', err);
            setShowMessage('Error saving customer. Please try again.');
            setTimeout(() => setShowMessage(''), 3000);
          }
        }}
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

export default MobileCustomerList;
