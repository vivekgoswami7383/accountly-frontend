import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'store';
import { createCustomer } from 'store/reducers/accountly/customers';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import ScreenHeader from 'components/accountly/ScreenHeader';
import CustomerForm from 'sections/accountly/CustomerForm';

const AddCustomer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { loading } = useSelector((s) => s.customers);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: { name: string; phone: string; address: string }) => {
    if (!user?.business?._id) {
      showSnackbar({ message: 'Business information not found', type: 'error' });
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      createCustomer({
        business: { _id: user.business._id, business_name: user.business.business_name || '' },
        name: values.name,
        phone: values.phone
      })
    );
    setSubmitting(false);
    if (createCustomer.fulfilled.match(result)) {
      navigate('/customer');
    } else {
      showSnackbar({ message: (result.payload as string) || 'Failed to add customer', type: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <ScreenHeader title="Add Customer" />
      <CustomerForm submitLabel="Add Customer" loading={loading || submitting} onSubmit={handleSubmit} />
    </Box>
  );
};

export default AddCustomer;
