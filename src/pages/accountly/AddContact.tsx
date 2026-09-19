import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useDispatch, useSelector } from 'store';
import { createContact } from 'store/reducers/accountly/contacts';
import useAuth from 'hooks/useAuth';
import AppHeader from 'components/accountly/AppHeader';
import ContactForm from 'sections/accountly/ContactForm';
import { useT } from 'i18n/accountly';
import { ContactType } from 'services/accountly/types';

const AddContact = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const t = useT();
  const { loading } = useSelector((s) => s.contacts);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { name: string; phone: string; address: string; contactType: ContactType | null }) => {
    setError(null);
    if (!user?.business_id) {
      setError(t('contactForm.businessInfoNotFound'));
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      createContact({
        name: values.name,
        phone: values.phone,
        address: values.address,
        type: values.contactType
      })
    );
    setSubmitting(false);
    if (createContact.fulfilled.match(result)) {
      navigate('/contact');
    } else {
      setError((result.payload as string) || t('contactForm.failedAdd'));
    }
  };

  return (
    <>
      <AppHeader variant="screen" title={t('contactForm.addTitle')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 3 }}>
        <ContactForm submitLabel={t('contactForm.addTitle')} loading={loading || submitting} error={error} onSubmit={handleSubmit} />
      </Container>
    </>
  );
};

export default AddContact;
