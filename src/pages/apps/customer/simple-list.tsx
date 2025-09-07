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
import AlertCustomerDelete from 'sections/apps/customer/AlertCustomerDelete';
import AddCustomerSimple from 'sections/apps/customer/AddCustomerSimple';
import ViewCustomer from 'sections/apps/customer/ViewCustomer';
import { customerAPI } from 'services/api';
import { SearchOutlined, PlusOutlined, EditTwoTone, DeleteTwoTone, EyeTwoTone } from '@ant-design/icons';

const CustomerSimpleList = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [customerToView, setCustomerToView] = useState<any>(null);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: // ACTIVE
        return 'success';
      case 2: // INACTIVE
        return 'warning';
      case 0: // DELETED
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1: // ACTIVE
        return 'Active';
      case 2: // INACTIVE
        return 'Inactive';
      case 0: // DELETED
        return 'Deleted';
      default:
        return 'Unknown';
    }
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerAPI.getAll();
      const customerData = response.data.data.customers || [];
      setCustomers(customerData);
      setFilteredCustomers(customerData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        (customer) =>
          customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (confirmed: boolean) => {
    setDeleteDialogOpen(false);

    if (confirmed && customerToDelete) {
      try {
        setLoading(true);
        await customerAPI.delete(customerToDelete._id);
        await fetchCustomers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete customer');
        console.error('Error deleting customer:', err);
      } finally {
        setLoading(false);
      }
    }

    setCustomerToDelete(null);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setAddDialogOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setAddDialogOpen(true);
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      setLoading(true);
      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, customerData);
      } else {
        await customerAPI.create(customerData);
      }
      await fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
      console.error('Error saving customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer: any) => {
    setCustomerToView(customer);
    setViewDialogOpen(true);
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
              placeholder={`Search ${filteredCustomers.length} records...`}
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
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAddCustomer} size="small">
                Add Customer
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
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id} hover>
                    <TableCell>
                      <Stack spacing={0}>
                        <Typography variant="subtitle1">
                          {customer.first_name} {customer.last_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.email || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={customer.balance < 0 ? 'error.main' : 'text.primary'}>
                        ₹{customer.balance || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(customer.status)}
                        color={getStatusColor(customer.status) as any}
                        size="small"
                        variant="light"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(customer.created_at).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
                        <Tooltip title="View">
                          <IconButton color="primary" size="small" onClick={() => handleViewCustomer(customer)}>
                            <EyeTwoTone />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton color="primary" size="small" onClick={() => handleEditCustomer(customer)}>
                            <EditTwoTone />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" size="small" onClick={() => handleDeleteCustomer(customer)}>
                            <DeleteTwoTone />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </ScrollX>

      <AddCustomerSimple
        open={addDialogOpen}
        onCancel={() => setAddDialogOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
        isEdit={!!editingCustomer}
      />

      <ViewCustomer open={viewDialogOpen} customer={customerToView} onClose={() => setViewDialogOpen(false)} />

      <AlertCustomerDelete
        title={`${customerToDelete?.first_name || ''} ${customerToDelete?.last_name || ''}`.trim() || 'Customer'}
        open={deleteDialogOpen}
        handleClose={handleDeleteConfirm}
      />
    </MainCard>
  );
};

export default CustomerSimpleList;
