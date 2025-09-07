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
import AddBusiness from 'sections/apps/business/AddBusiness';
import AlertBusinessDelete from 'sections/apps/business/AlertBusinessDelete';
import { businessAPI } from 'services/api';
import { SearchOutlined, PlusOutlined, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<any>(null);

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

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case 'kirana_shop':
        return 'Kirana Shop';
      case 'pan_shop':
        return 'Pan Shop';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await businessAPI.getAll();
      const businessData = response.data.data?.businesses || [];
      setBusinesses(businessData);
      setFilteredBusinesses(businessData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch businesses');
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter businesses based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = businesses.filter(
        (business) =>
          business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.gst_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.user?.phone?.includes(searchTerm)
      );
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchTerm, businesses]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setAddDialogOpen(true);
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);
    setAddDialogOpen(true);
  };

  const handleSaveBusiness = async (businessData: any) => {
    try {
      setLoading(true);
      if (editingBusiness) {
        await businessAPI.update(editingBusiness._id, businessData);
      } else {
        await businessAPI.create(businessData);
      }
      await fetchBusinesses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save business');
      console.error('Error saving business:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = (business: any) => {
    setBusinessToDelete(business);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (confirmed: boolean) => {
    setDeleteDialogOpen(false);

    if (confirmed && businessToDelete) {
      try {
        setLoading(true);
        await businessAPI.delete(businessToDelete._id);
        await fetchBusinesses();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete business');
        console.error('Error deleting business:', err);
      } finally {
        setLoading(false);
      }
    }

    setBusinessToDelete(null);
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
              placeholder={`Search ${filteredBusinesses.length} records...`}
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
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAddBusiness} size="small">
                Add Business
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
                  <TableCell>Business Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>GST Number</TableCell>
                  <TableCell>Owner Name</TableCell>
                  <TableCell>Owner Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredBusinesses.map((business) => (
                  <TableRow key={business._id} hover>
                    <TableCell>
                      <Stack spacing={0}>
                        <Typography variant="subtitle1">{business.business_name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{getBusinessTypeLabel(business.business_type)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{business.address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{business.gst_number || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {business.user?.first_name} {business.user?.last_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{business.user?.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(business.status)}
                        color={getStatusColor(business.status) as any}
                        size="small"
                        variant="light"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(business.created_at).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
                        <Tooltip title="Edit">
                          <IconButton color="primary" size="small" onClick={() => handleEditBusiness(business)}>
                            <EditTwoTone />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" size="small" onClick={() => handleDeleteBusiness(business)}>
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

      <AddBusiness
        open={addDialogOpen}
        onCancel={() => setAddDialogOpen(false)}
        onSave={handleSaveBusiness}
        business={editingBusiness}
        isEdit={!!editingBusiness}
      />

      <AlertBusinessDelete title={businessToDelete?.business_name || ''} open={deleteDialogOpen} handleClose={handleDeleteConfirm} />
    </MainCard>
  );
};

export default BusinessList;
