import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Calendar, Camera, Check, ChevronDown, FileText, X } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { createTransaction, fetchTransactionById, updateTransactionById } from 'store/reducers/accountly/transactions';
import { fetchCustomers } from 'store/reducers/accountly/customers';
import { TransactionType } from 'services/accountly/types';
import uploadService from 'services/accountly/uploadService';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import useCalculatorInput from 'hooks/useCalculatorInput';
import { getCurrency } from 'data/currencies';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import TransactionSuccessAnimation from 'components/accountly/TransactionSuccessAnimation';
import CalculatorKeypad from 'components/accountly/CalculatorKeypad';
import useConfig from 'hooks/useConfig';

const toDateInputValue = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const todayStr = () => toDateInputValue(new Date());

const formatPillDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

  const calc = useCalculatorInput();
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr());
  const [initialDate, setInitialDate] = useState(todayStr());
  const [amountError, setAmountError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(true);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const loadedRef = useRef(false);
  const amountBoxRef = useRef<HTMLElement | null>(null);
  const bottomPanelRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachmentKey, setAttachmentKey] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  const isEdit = Boolean(transactionId);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (transactionId) dispatch(fetchTransactionById(transactionId));
  }, [dispatch, transactionId]);

  useEffect(() => {
    if (transactionId && selectedTransaction && selectedTransaction.id === transactionId && !loadedRef.current) {
      loadedRef.current = true;
      calc.setFromAmount(selectedTransaction.amount);
      setDescription(selectedTransaction.description || '');
      const loadedDate = toDateInputValue(new Date(selectedTransaction.createdAt));
      setDate(loadedDate);
      setInitialDate(loadedDate);
      setAttachmentUrl(selectedTransaction.attachmentUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const openCalculator = () => {
    setCalculatorOpen(true);
    descriptionRef.current?.blur();
  };

  useEffect(() => {
    if (!calculatorOpen) return undefined;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (amountBoxRef.current?.contains(target)) return;
      if (bottomPanelRef.current?.contains(target)) return;
      setCalculatorOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [calculatorOpen]);

  const handleAttachBills = () => fileInputRef.current?.click();

  const handleAttachmentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAttachmentUploading(true);
    try {
      const result = await uploadService.uploadFile(file, 'attachment', isEdit ? transactionId : undefined);
      setAttachmentKey(result.key);
      setAttachmentUrl(result.url);
    } catch (error) {
      showSnackbar({ message: t('payment.failedAttachImage'), type: 'error' });
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleRemoveAttachment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachmentKey('');
    setAttachmentUrl(null);
  };

  const handleSubmit = async () => {
    const value = calc.amount;
    if (!calc.expression || isNaN(value) || value <= 0) {
      setAmountError(true);
      return;
    }
    if (!customer) {
      showSnackbar({ message: t('payment.customerNotFound'), type: 'error' });
      return;
    }

    const transaction_date = date !== initialDate ? new Date(`${date}T12:00:00`).toISOString() : undefined;

    if (isEdit && transactionId) {
      const result = await dispatch(
        updateTransactionById({
          id: transactionId,
          data: {
            amount: value,
            description: description.trim() || undefined,
            transaction_type: transactionType,
            transaction_date,
            ...(attachmentKey != null ? { attachment_key: attachmentKey } : {})
          }
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
        description: description.trim() || '',
        transaction_date,
        ...(attachmentKey ? { attachment_key: attachmentKey } : {})
      })
    );
    if (createTransaction.fulfilled.match(result)) setSuccess(true);
    else showSnackbar({ message: (result.payload as string) || t('payment.failedRecordEntry'), type: 'error' });
  };

  const keypadHandlers = {
    onDigit: (d: string) => {
      setAmountError(false);
      calc.pressDigit(d);
    },
    onDot: () => {
      setAmountError(false);
      calc.pressDot();
    },
    onOperator: (op: string) => calc.pressOperator(op),
    onClear: calc.pressClear,
    onBackspace: calc.pressBackspace,
    onEquals: calc.pressEquals,
    onMemoryAdd: calc.pressMemoryAdd,
    onMemorySubtract: calc.pressMemorySubtract,
    onRecallMemory: calc.recallMemory
  };

  return (
    <>
      <AppHeader
        variant="screen"
        title={
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, color: accentDeep }} noWrap>
            {title}
          </Typography>
        }
      />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.5, pb: 'calc(500px + env(safe-area-inset-bottom, 0px))' }}>
        <Stack spacing={2.25}>
          <Box
            component="button"
            ref={amountBoxRef}
            onClick={openCalculator}
            sx={{
              bgcolor: c.surface,
              borderRadius: '20px',
              boxShadow: '0 1px 2px rgba(20,23,26,0.04)',
              border: `1.5px solid ${amountError ? c.red : calculatorOpen ? accent : c.border}`,
              px: 2.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 24, color: c.greyLight }}>{currencySymbol}</Typography>
            <Typography
              sx={{
                flex: '0 1 auto',
                minWidth: 0,
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: calc.display.length > 12 ? 18 : 26,
                letterSpacing: '-0.02em',
                color: accentDeep,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {calc.display || <Box component="span" sx={{ color: c.greyIcon }}>0</Box>}
            </Typography>
            {calculatorOpen && (
              <Box
                sx={{
                  width: 2,
                  height: 20,
                  bgcolor: accentDeep,
                  flexShrink: 0,
                  animation: 'accountlyBlink 1s step-end infinite',
                  '@keyframes accountlyBlink': { '50%': { opacity: 0 } }
                }}
              />
            )}
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
              ref={descriptionRef}
              rows={2}
              placeholder={t('payment.addNote')}
              value={description}
              onFocus={() => setCalculatorOpen(false)}
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

          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: '14px',
                border: `1.5px solid ${c.border}`,
                bgcolor: c.surface,
                px: 1.5,
                py: 1.25
              }}
            >
              <Calendar size={16} color={c.greyLight} style={{ flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: c.ink }} noWrap>
                {formatPillDate(date)}
              </Typography>
              <Box
                component="input"
                type="date"
                value={date}
                max={todayStr()}
                onFocus={() => setCalculatorOpen(false)}
                onChange={(e: any) => setDate(e.target.value)}
                sx={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}
              />
            </Box>
            <Box
              component="button"
              onClick={handleAttachBills}
              disabled={attachmentUploading}
              sx={{
                flex: 1,
                minWidth: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: '14px',
                border: `1.5px solid ${attachmentUrl ? accent : c.border}`,
                bgcolor: c.surface,
                color: attachmentUrl ? accentDeep : c.greyLight,
                pl: 1.5,
                pr: attachmentUrl && !attachmentUploading ? 4 : 1.5,
                py: 1.25,
                cursor: attachmentUploading ? 'default' : 'pointer',
                fontFamily: DISPLAY
              }}
            >
              {attachmentUrl ? <Check size={16} color={accentDeep} style={{ flexShrink: 0 }} /> : <Camera size={16} style={{ flexShrink: 0 }} />}
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'center',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: attachmentUrl ? accentDeep : c.greyLight,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {attachmentUploading ? t('payment.uploadingImage') : attachmentUrl ? t('payment.imageAttached') : t('payment.attachBills')}
              </Typography>
              {attachmentUrl && !attachmentUploading && (
                <Box
                  component="span"
                  onClick={handleRemoveAttachment}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    color: c.greyLight,
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </Box>
              )}
            </Box>
            <Box
              component="input"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              ref={fileInputRef}
              onChange={handleAttachmentFileChange}
              sx={{ display: 'none' }}
            />
          </Stack>
        </Stack>
      </Container>

      <Box
        ref={bottomPanelRef}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 25,
          bgcolor: c.surface,
          borderTop: `1px solid ${c.line}`,
          boxShadow: '0 -8px 24px -12px rgba(20,23,26,0.12)',
          pt: 1.5,
          pb: 'calc(14px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <Container maxWidth="sm" sx={{ px: 2.25 }}>
          {calculatorOpen ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <Box
                  component="button"
                  onClick={() => setCalculatorOpen(false)}
                  aria-label="Collapse calculator"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 22,
                    border: 'none',
                    bgcolor: 'transparent',
                    color: c.greyIcon,
                    cursor: 'pointer'
                  }}
                >
                  <ChevronDown size={20} />
                </Box>
              </Box>
              <CalculatorKeypad
                accent={accent}
                accentDeep={accentDeep}
                memory={calc.memory}
                {...keypadHandlers}
                onSubmit={handleSubmit}
                submitDisabled={loading}
                submitLabel={loading ? t('common.saving') : isEdit ? t('payment.update') : t('payment.saveEntry')}
              />
            </Box>
          ) : (
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={{ bgcolor: accent, boxShadow: 'none', '&:hover': { bgcolor: accentDeep } }}
            >
              {loading ? t('common.saving') : isEdit ? t('payment.update') : t('payment.saveEntry')}
            </Button>
          )}
        </Container>
      </Box>

      <TransactionSuccessAnimation visible={success} onComplete={() => navigate(-1)} />
    </>
  );
};

export default Payment;
