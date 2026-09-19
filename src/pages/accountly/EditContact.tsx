import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import { useDispatch, useSelector } from 'store';
import { fetchContacts, updateContact } from 'store/reducers/accountly/contacts';
import AppHeader from 'components/accountly/AppHeader';
import ContactForm from 'sections/accountly/ContactForm';
import countries, { CountryType } from 'data/countries';
import { DEFAULT_COUNTRY } from 'components/accountly/CountryCodePicker';
import { useT } from 'i18n/accountly';
import uploadService from 'services/accountly/uploadService';
import { ContactType } from 'services/accountly/types';

const splitPhone = (full: string): { country: CountryType; local: string } => {
  const match = [...countries].filter((x) => full.startsWith(x.phone)).sort((a, b) => b.phone.length - a.phone.length)[0];
  if (match) return { country: match, local: full.slice(match.phone.length) };
  return { country: DEFAULT_COUNTRY, local: full.replace(/^\+/, '') };
};

const EditContact = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useT();
  const { contacts, loading } = useSelector((s) => s.contacts);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const contact = contacts.find((x) => x.id === id);

  useEffect(() => {
    if (contacts.length === 0) dispatch(fetchContacts());
  }, [dispatch, contacts.length]);

  useEffect(
    () => () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    },
    [pendingPreview]
  );

  const initial = useMemo(() => {
    if (!contact) return undefined;
    const { country, local } = splitPhone(contact.phone || '');
    return { name: contact.name, phone: local, address: contact.address, country, contactType: contact.contactType };
  }, [contact]);

  const handleSubmit = async (values: { name: string; phone: string; address: string; contactType: ContactType | null }) => {
    if (!contact) return;
    setError(null);
    setSubmitting(true);
    let imageKey: string | undefined;
    if (pendingFile) {
      try {
        const uploaded = await uploadService.uploadFile(pendingFile, 'contact', contact.id);
        imageKey = uploaded.key;
      } catch (e: any) {
        setSubmitting(false);
        setError(e?.message || t('contactForm.failedImageUpload'));
        return;
      }
    } else if (imageRemoved) {
      imageKey = '';
    }
    const { contactType, ...fields } = values;
    const result = await dispatch(
      updateContact({
        id: contact.id,
        data: { ...fields, contact_type: contactType, ...(imageKey !== undefined ? { image_key: imageKey } : {}) }
      })
    );
    setSubmitting(false);
    if (updateContact.fulfilled.match(result)) navigate(-1);
    else setError((result.payload as string) || t('contactForm.failedUpdate'));
  };

  const handleImageSelect = (file: File) => {
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const handleImageRemove = () => {
    setPendingFile(null);
    setPendingPreview(null);
    setImageRemoved(true);
  };

  const displayedImage = pendingPreview || (imageRemoved ? null : contact?.imageUrl);

  return (
    <>
      <AppHeader variant="screen" title={t('contactForm.editTitle')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 3 }}>
        {initial && (
          <ContactForm
            initial={initial}
            submitLabel={t('contactForm.saveChanges')}
            loading={loading || submitting}
            error={error}
            imageUrl={displayedImage}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            onSubmit={handleSubmit}
          />
        )}
      </Container>
    </>
  );
};

export default EditContact;
