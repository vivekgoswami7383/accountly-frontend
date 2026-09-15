import { useEffect, useState, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { ArrowUp, ArrowDown, Calendar, Trash2, Pencil, MoreVertical, TriangleAlert, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchTransactionById, deleteTransactionById } from 'store/reducers/accountly/transactions';
import { useFormatAmount, formatDateTime } from 'utils/accountly/format';
import useSnackbar from 'hooks/useSnackbar';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, IconDot, ListRow } from 'components/accountly/kit';

const TransactionDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { showSnackbar } = useSnackbar();

  const { selectedTransaction, loading } = useSelector((s) => s.transactions);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);

  const isCurrent = selectedTransaction?.id === id;

  useEffect(() => {
    dispatch(fetchTransactionById(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    setConfirmDelete(false);
    const result = await dispatch(deleteTransactionById({ id, customerId: selectedTransaction?.customerId || '' }));
    if (deleteTransactionById.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || t('payment.failedDeleteEntry'), type: 'error' });
  };

  const sent = selectedTransaction?.transaction_type === 'debit';
  const accentDeep = sent ? c.redDeep : c.greenDeep;
  const accentSoft = sent ? c.redSoft : c.greenSoft;

  const headerRight = (
    <IconButton
      onClick={(e: MouseEvent<HTMLElement>) => setMenuEl(e.currentTarget)}
      disabled={!isCurrent || loading}
      sx={{ color: c.ink }}
    >
      <MoreVertical size={20} />
    </IconButton>
  );

  return (
    <>
      <AppHeader variant="screen" title={t('transactionDetail.title')} right={headerRight} />
      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            navigate(`/transaction/${id}/edit`);
          }}
          sx={{ gap: 1.25 }}
        >
          <Pencil size={16} /> {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            setConfirmDelete(true);
          }}
          sx={{ gap: 1.25, color: c.red }}
        >
          <Trash2 size={16} /> {t('common.delete')}
        </MenuItem>
      </Menu>
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.5, pb: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {!isCurrent || loading ? (
          <Stack spacing={2.25} alignItems="center" sx={{ py: 4 }}>
            <Skeleton variant="circular" width={64} height={64} />
            <Skeleton variant="text" width={140} height={40} />
            <Skeleton variant="text" width={180} height={20} />
          </Stack>
        ) : (
          <Stack spacing={2.25}>
            <Box sx={{ bgcolor: accentSoft, borderRadius: '24px', px: 2.5, py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconDot size={56} bg={c.surface} fg={accentDeep} icon={24}>
                {sent ? <ArrowUp /> : <ArrowDown />}
              </IconDot>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 34, letterSpacing: '-0.02em', color: accentDeep, mt: 1.75 }}>
                {fmt(selectedTransaction!.amount)}
              </Typography>
              <Box sx={{ bgcolor: c.surface, borderRadius: '8px', px: 1.5, py: 0.5, mt: 1.25 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: accentDeep, letterSpacing: '0.02em' }}>
                  {sent ? t('detail.youGave') : t('detail.youGot')}
                </Typography>
              </Box>
            </Box>

            <AppCard sx={{ overflow: 'hidden' }}>
              <ListRow onClick={() => navigate(`/customer/${selectedTransaction!.customerId}`)}>
                <IconDot size={40} bg={avatarTint(selectedTransaction!.customerName).bg} fg={avatarTint(selectedTransaction!.customerName).fg}>
                  <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 13 }}>{initials(selectedTransaction!.customerName)}</Typography>
                </IconDot>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('transactionDetail.viewCustomer')}</Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 15, color: c.ink }} noWrap>
                    {selectedTransaction!.customerName}
                  </Typography>
                </Box>
                <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
              </ListRow>
              <Divider sx={{ borderColor: c.line, ml: 2 }} />
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                <IconDot size={40} bg={c.chipGrey} fg={c.grey} icon={18}>
                  <Calendar />
                </IconDot>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('payment.date')}</Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 15, color: c.ink, mt: 0.25 }}>
                    {formatDateTime(selectedTransaction!.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </AppCard>

            {selectedTransaction!.description && (
              <AppCard sx={{ display: 'flex', gap: 1.5, p: 2 }}>
                <Box sx={{ width: 3, borderRadius: '3px', bgcolor: accentDeep, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('transactionDetail.note')}</Typography>
                  <Typography sx={{ fontSize: 14, color: c.ink, mt: 0.25, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {selectedTransaction!.description}
                  </Typography>
                </Box>
              </AppCard>
            )}
          </Stack>
        )}
      </Container>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: DISPLAY, pt: 2.25, pb: 0.75, fontSize: '1.05rem' }}>
          <TriangleAlert size={18} color={c.red} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          {t('payment.deleteEntryQ')}
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important', pb: 1 }}>
          <DialogContentText sx={{ color: c.grey, fontSize: 13.5, lineHeight: 1.45 }}>{t('payment.deleteEntryBody')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
          <Button onClick={() => setConfirmDelete(false)} variant="outlined">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransactionDetail;
