import { useEffect, useState, MouseEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { ArrowUp, ArrowDown, Calendar, CalendarClock, Phone, FileText, Paperclip, Trash2, Pencil, MoreVertical, TriangleAlert, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchTransactionById, deleteTransactionById } from 'store/reducers/accountly/transactions';
import { fetchContacts } from 'store/reducers/accountly/contacts';
import useDueText from 'hooks/useDueText';
import { dueState, formatDueDate } from 'utils/accountly/due';
import { useFormatAmount, formatDateTime, formatPhone } from 'utils/accountly/format';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, IconDot, ListRow, FormAlert } from 'components/accountly/kit';

const TransactionDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();

  const location = useLocation();
  const fromContact = Boolean((location.state as { fromContact?: boolean } | null)?.fromContact);
  const dueText = useDueText();

  const { selectedTransaction, loading } = useSelector((s) => s.transactions);
  const { contacts, hasLoaded: contactsLoaded } = useSelector((s) => s.contacts);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  const isCurrent = selectedTransaction?.id === id;

  useEffect(() => {
    dispatch(fetchTransactionById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!fromContact && !contactsLoaded) dispatch(fetchContacts());
  }, [dispatch, fromContact, contactsLoaded]);

  const handleDelete = async () => {
    setConfirmDelete(false);
    setError(null);
    const result = await dispatch(deleteTransactionById({ id, contactId: selectedTransaction?.contactId || '' }));
    if (deleteTransactionById.fulfilled.match(result)) navigate(-1);
    else setError((result.payload as string) || t('payment.failedDeleteEntry'));
  };

  const sent = selectedTransaction?.transaction_type === 'debit';
  const txContact = contacts.find((x) => x.id === selectedTransaction?.contactId);
  const contactAvatar = avatarTint(selectedTransaction?.contactName || '');
  const dueDate = selectedTransaction?.dueDate || null;
  const dueOverdue = dueDate ? dueState(dueDate) === 'overdue' : false;
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
        <Box sx={{ mb: error ? 2.25 : 0 }}>
          <FormAlert message={error} />
        </Box>
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
              {!fromContact && (
                <>
                  <ListRow onClick={() => navigate(`/contact/${selectedTransaction!.contactId}`)}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: txContact?.imageUrl ? 'transparent' : contactAvatar.bg,
                        color: contactAvatar.fg,
                        fontFamily: DISPLAY,
                        fontWeight: 500,
                        fontSize: 14,
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {txContact?.imageUrl ? (
                        <Box component="img" src={txContact.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials(selectedTransaction!.contactName)
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                        {selectedTransaction!.contactName}
                      </Typography>
                      {txContact?.phone && (
                        <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0, mt: 0.25 }}>
                          <Phone size={12} color={c.greyLight} style={{ flexShrink: 0 }} />
                          <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                            {formatPhone(txContact.phone)}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                  </ListRow>
                  <Divider sx={{ borderColor: c.line, ml: 2 }} />
                </>
              )}
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

              {dueDate && (
                <>
                  <Divider sx={{ borderColor: c.line, ml: 2 }} />
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <IconDot size={40} bg={dueOverdue ? c.redSoft : c.chipGrey} fg={dueOverdue ? c.redDeep : c.grey} icon={18}>
                      <CalendarClock />
                    </IconDot>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('due.add')}</Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: 15, color: dueOverdue ? c.redDeep : c.ink, mt: 0.25 }}>
                        {formatDueDate(dueDate)} · {dueText(dueDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}

              {selectedTransaction!.description && (
                <>
                  <Divider sx={{ borderColor: c.line, ml: 2 }} />
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <IconDot size={40} bg={c.chipGrey} fg={c.grey} icon={18}>
                      <FileText />
                    </IconDot>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('transactionDetail.note')}</Typography>
                      <Typography sx={{ fontSize: 14, color: c.ink, mt: 0.25, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {selectedTransaction!.description}
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}

              {selectedTransaction!.attachmentUrl && (
                <>
                  <Divider sx={{ borderColor: c.line, ml: 2 }} />
                  <ListRow onClick={() => window.open(selectedTransaction!.attachmentUrl, '_blank', 'noopener,noreferrer')}>
                    <IconDot size={40} bg={c.chipGrey} fg={c.grey} icon={18}>
                      <Paperclip />
                    </IconDot>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('transactionDetail.attachment')}</Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: 15, color: c.ink }} noWrap>
                        {t('transactionDetail.viewAttachment')}
                      </Typography>
                    </Box>
                    <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                  </ListRow>
                </>
              )}
            </AppCard>
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
