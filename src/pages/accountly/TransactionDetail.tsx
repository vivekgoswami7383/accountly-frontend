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
import { ArrowUp, ArrowDown, FileText, Trash2, Pencil, MoreHorizontal, TriangleAlert, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchTransactionById, deleteTransactionById } from 'store/reducers/accountly/transactions';
import { useFormatAmount, formatDateTime } from 'utils/accountly/format';
import useSnackbar from 'hooks/useSnackbar';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
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
    const result = await dispatch(deleteTransactionById(id));
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
      <MoreHorizontal size={20} />
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
            <Stack alignItems="center" spacing={1} sx={{ pt: 1, pb: 0.5 }}>
              <IconDot size={64} bg={accentSoft} fg={accentDeep} icon={28}>
                {sent ? <ArrowUp /> : <ArrowDown />}
              </IconDot>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 32, letterSpacing: '-0.02em', color: accentDeep }}>
                {fmt(selectedTransaction!.amount)}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 14 }}>
                {sent ? t('detail.youGave') : t('detail.youGot')}
              </Typography>
            </Stack>

            <AppCard sx={{ overflow: 'hidden' }}>
              <ListRow onClick={() => navigate(`/customer/${selectedTransaction!.customerId}`)}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('transactionDetail.viewCustomer')}</Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 15, color: c.ink }} noWrap>
                    {selectedTransaction!.customerName}
                  </Typography>
                </Box>
                <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
              </ListRow>
              <Divider sx={{ borderColor: c.line, ml: 2 }} />
              <Box sx={{ px: 2, py: 1.75 }}>
                <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('payment.date')}</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 15, color: c.ink, mt: 0.25 }}>
                  {formatDateTime(selectedTransaction!.createdAt)}
                </Typography>
              </Box>
              {selectedTransaction!.description && (
                <>
                  <Divider sx={{ borderColor: c.line, ml: 2 }} />
                  <Stack direction="row" spacing={1.25} sx={{ px: 2, py: 1.75 }}>
                    <FileText size={18} color={c.greyLight} style={{ marginTop: 2, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('transactionDetail.note')}</Typography>
                      <Typography sx={{ fontSize: 14, color: c.ink, mt: 0.25, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {selectedTransaction!.description}
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}
            </AppCard>
          </Stack>
        )}
      </Container>

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
    </>
  );
};

export default TransactionDetail;
