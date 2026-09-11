import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useDispatch, useSelector } from 'store';
import { createCustomer } from 'store/reducers/accountly/customers';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import AppHeader from 'components/accountly/AppHeader';
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
        name: values.name,
        phone: values.phone,
        address: values.address
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
    <>
      <AppHeader variant="screen" title="Add Customer" />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 3 }}>
        <CustomerForm submitLabel="Add Customer" loading={loading || submitting} onSubmit={handleSubmit} />
      </Container>
    </>
  );
};

export default AddCustomer;
