import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useDispatch, useSelector } from 'store';
import { createCustomer } from 'store/reducers/accountly/customers';
import useAuth from 'hooks/useAuth';
import AppHeader from 'components/accountly/AppHeader';
import CustomerForm from 'sections/accountly/CustomerForm';
import { useT } from 'i18n/accountly';

const AddCustomer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const t = useT();
  const { loading } = useSelector((s) => s.customers);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { name: string; phone: string; address: string }) => {
    setError(null);
    if (!user?.business_id) {
      setError(t('customerForm.businessInfoNotFound'));
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
      setError((result.payload as string) || t('customerForm.failedAdd'));
    }
  };

  return (
    <>
      <AppHeader variant="screen" title={t('customerForm.addTitle')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 3 }}>
        <CustomerForm submitLabel={t('customerForm.addTitle')} loading={loading || submitting} error={error} onSubmit={handleSubmit} />
      </Container>
    </>
  );
};

export default AddCustomer;
