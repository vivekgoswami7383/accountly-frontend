import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import { FileText, Trash2, TriangleAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import {
  createTransaction,
  fetchTransactionById,
  updateTransactionById,
  deleteTransactionById
} from 'store/reducers/accountly/transactions';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { TransactionType } from 'services/accountly/types';
import { formatAmountInput } from 'utils/accountly/format';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import useConfig from 'hooks/useConfig';
import { getCurrency } from 'data/currencies';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import TransactionSuccessAnimation from 'components/accountly/TransactionSuccessAnimation';
import { BottomActionBar, FOOTER_SPACE } from 'components/accountly/kit';

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: transactionId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const c = useAccountlyColors();
  const t = useT();
  const { currency } = useConfig();
  const currencySymbol = getCurrency(currency).symbol;

  const customerId = params.get('customerId') || '';
  const type = params.get('type') === 'refund' ? 'refund' : 'payment';

  const { customers } = useSelector((s) => s.customers);
  const { selectedTransaction, loading } = useSelector((s) => s.transactions);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEdit = Boolean(transactionId);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (transactionId) dispatch(fetchTransactionById(transactionId));
  }, [dispatch, transactionId]);

  useEffect(() => {
    if (transactionId && selectedTransaction && selectedTransaction.id === transactionId) {
      setAmount(String(selectedTransaction.amount));
      setDescription(selectedTransaction.description || '');
    }
  }, [transactionId, selectedTransaction]);

  const customer = useMemo(() => {
    if (isEdit) {
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        return { id: selectedTransaction.customerId, name: selectedTransaction.customerName };
      }
      return null;
    }
    const found = customers.find((x) => x.id === customerId);
    return found ? { id: found.id, name: found.name } : null;
  }, [isEdit, selectedTransaction, transactionId, customers, customerId]);

  const transactionType: TransactionType = isEdit
    ? selectedTransaction?.transaction_type || 'debit'
    : type === 'payment'
    ? 'debit'
    : 'credit';

  const isDebit = transactionType === 'debit';
  const title = isEdit ? t('payment.editEntry') : isDebit ? t('payment.youGaveTitle') : t('payment.youGotTitle');
  const accent = isDebit ? c.red : c.green;
  const accentDeep = isDebit ? c.redDeep : c.greenDeep;

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setAmountError(true);
      return;
    }
    if (!customer) {
      showSnackbar({ message: t('payment.customerNotFound'), type: 'error' });
      return;
    }

    if (isEdit && transactionId) {
      const result = await dispatch(
        updateTransactionById({
          id: transactionId,
          data: { amount: value, description: description.trim() || undefined, transaction_type: transactionType }
        })
      );
      if (updateTransactionById.fulfilled.match(result)) navigate(-1);
      else showSnackbar({ message: (result.payload as string) || t('payment.failedUpdateEntry'), type: 'error' });
      return;
    }

    if (!user?.business_id) {
      showSnackbar({ message: t('customerForm.businessInfoNotFound'), type: 'error' });
      return;
    }
    const result = await dispatch(
      createTransaction({
        customer: { _id: customer.id, name: customer.name },
        amount: value,
        transaction_type: transactionType,
        description: description.trim() || ''
      })
    );
    if (createTransaction.fulfilled.match(result)) setSuccess(true);
    else showSnackbar({ message: (result.payload as string) || t('payment.failedRecordEntry'), type: 'error' });
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!transactionId) return;
    const result = await dispatch(deleteTransactionById(transactionId));
    if (deleteTransactionById.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || t('payment.failedDeleteEntry'), type: 'error' });
  };

  return (
    <>
      <AppHeader variant="screen" title={title} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.5, pb: FOOTER_SPACE }}>
        <Stack spacing={3}>
          {customer && (
            <Typography sx={{ color: c.grey, fontSize: 14 }}>
              {isDebit ? t('payment.to') : t('payment.from')}{' '}
              <Box component="span" sx={{ color: c.ink, fontWeight: 700 }}>
                {customer.name}
              </Box>
            </Typography>
          )}

          <Box
            sx={{
              bgcolor: c.surface,
              borderRadius: '20px',
              boxShadow: '0 1px 2px rgba(20,23,26,0.04)',
              border: `1.5px solid ${amountError ? c.red : c.border}`,
              px: 2.5,
              py: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: c.greyLight }}>{currencySymbol}</Typography>
            <Box
              component="input"
              autoFocus
              inputMode="decimal"
              placeholder="0"
              value={formatAmountInput(amount)}
              onChange={(e: any) => {
                setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                setAmountError(false);
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                bgcolor: 'transparent',
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: '-0.02em',
                color: accentDeep,
                '::placeholder': { color: c.greyIcon }
              }}
            />
          </Box>

          <Box
            sx={{
              bgcolor: c.surface,
              borderRadius: '14px',
              border: `1.5px solid ${c.border}`,
              px: 2,
              py: 1.75,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25
            }}
          >
            <FileText size={20} color={c.greyLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <Box
              component="textarea"
              rows={3}
              placeholder={t('payment.addNote')}
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              maxLength={200}
              sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                resize: 'none',
                bgcolor: 'transparent',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: c.ink,
                '::placeholder': { color: c.greyLight }
              }}
            />
          </Box>
        </Stack>
      </Container>

      <BottomActionBar>
        {isEdit ? (
          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Trash2 size={18} />}
              disabled={loading}
              onClick={() => setConfirmDelete(true)}
              sx={{ color: c.red, borderColor: c.border }}
            >
              {t('common.delete')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={{ bgcolor: accent, boxShadow: 'none', '&:hover': { bgcolor: accentDeep } }}
            >
              {loading ? t('common.saving') : t('payment.update')}
            </Button>
          </Stack>
        ) : (
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
            sx={{ bgcolor: accent, boxShadow: 'none', '&:hover': { bgcolor: accentDeep } }}
          >
            {loading ? t('common.saving') : t('payment.saveEntry')}
          </Button>
        )}
      </BottomActionBar>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: DISPLAY }}>
          <TriangleAlert size={18} color={c.red} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          {t('payment.deleteEntryQ')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: c.grey }}>{t('payment.deleteEntryBody')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmDelete(false)} variant="outlined">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <TransactionSuccessAnimation visible={success} onComplete={() => navigate(-1)} />
    </>
  );
};

export default Payment;
