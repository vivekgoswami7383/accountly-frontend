import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers, updateCustomer } from 'store/reducers/accountly/customers';
import useSnackbar from 'hooks/useSnackbar';
import AppHeader from 'components/accountly/AppHeader';
import CustomerForm from 'sections/accountly/CustomerForm';
import countries, { CountryType } from 'data/countries';
import { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { useT } from 'i18n/accountly';

const splitPhone = (full: string): { country: CountryType; local: string } => {
  const match = [...countries].filter((x) => full.startsWith(x.phone)).sort((a, b) => b.phone.length - a.phone.length)[0];
  if (match) return { country: match, local: full.slice(match.phone.length) };
  return { country: DEFAULT_COUNTRY, local: full.replace(/^\+/, '') };
};

const EditCustomer = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const t = useT();
  const { customers, loading } = useSelector((s) => s.customers);
  const [submitting, setSubmitting] = useState(false);

  const customer = customers.find((x) => x.id === id);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  const initial = useMemo(() => {
    if (!customer) return undefined;
    const { country, local } = splitPhone(customer.phone || '');
    return { name: customer.name, phone: local, address: customer.address, country };
  }, [customer]);

  const handleSubmit = async (values: { name: string; phone: string; address: string }) => {
    if (!customer) return;
    setSubmitting(true);
    const result = await dispatch(updateCustomer({ id: customer.id, data: values }));
    setSubmitting(false);
    if (updateCustomer.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || t('customerForm.failedUpdate'), type: 'error' });
  };

  return (
    <>
      <AppHeader variant="screen" title={t('customerForm.editTitle')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 3 }}>
        {initial && (
          <CustomerForm initial={initial} submitLabel={t('customerForm.saveChanges')} loading={loading || submitting} onSubmit={handleSubmit} />
        )}
      </Container>
    </>
  );
};

export default EditCustomer;
