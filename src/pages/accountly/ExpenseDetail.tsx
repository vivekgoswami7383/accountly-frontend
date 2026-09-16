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
import { Calendar, FileText, Trash2, Pencil, MoreVertical, TriangleAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchExpenseById, deleteExpenseById } from 'store/reducers/accountly/expenses';
import { useFormatAmount, formatDateTime } from 'utils/accountly/format';
import { EXPENSE_CATEGORY_ICONS, expenseCategoryLabelKey } from 'utils/accountly/expenseCategories';
import useSnackbar from 'hooks/useSnackbar';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, IconDot } from 'components/accountly/kit';

const ExpenseDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { showSnackbar } = useSnackbar();

  const { selectedExpense, loading } = useSelector((s) => s.expenses);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);

  const isCurrent = selectedExpense?.id === id;

  useEffect(() => {
    dispatch(fetchExpenseById(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    setConfirmDelete(false);
    const result = await dispatch(deleteExpenseById({ id }));
    if (deleteExpenseById.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || t('expense.failedDeleteEntry'), type: 'error' });
  };

  const Icon = selectedExpense ? EXPENSE_CATEGORY_ICONS[selectedExpense.category] : null;

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
      <AppHeader variant="screen" title={t('expenseDetail.title')} right={headerRight} />
      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            navigate(`/expense/${id}/edit`);
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
        {!isCurrent || loading || !Icon ? (
          <Stack spacing={2.25} alignItems="center" sx={{ py: 4 }}>
            <Skeleton variant="circular" width={64} height={64} />
            <Skeleton variant="text" width={140} height={40} />
            <Skeleton variant="text" width={180} height={20} />
          </Stack>
        ) : (
          <Stack spacing={2.25}>
            <Stack alignItems="center" spacing={1} sx={{ pt: 1, pb: 0.5 }}>
              <IconDot size={64} bg={c.redSoft} fg={c.redDeep} icon={28}>
                <Icon />
              </IconDot>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 32, letterSpacing: '-0.02em', color: c.redDeep }}>
                {fmt(selectedExpense!.amount)}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 14 }}>{t(expenseCategoryLabelKey(selectedExpense!.category))}</Typography>
            </Stack>

            <AppCard sx={{ overflow: 'hidden' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                <IconDot size={40} bg={c.chipGrey} fg={c.grey} icon={18}>
                  <Calendar />
                </IconDot>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('payment.date')}</Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 15, color: c.ink, mt: 0.25 }}>
                    {formatDateTime(selectedExpense!.expenseDate)}
                  </Typography>
                </Box>
              </Stack>

              {selectedExpense!.note && (
                <>
                  <Divider sx={{ borderColor: c.line, ml: 2 }} />
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <IconDot size={40} bg={c.chipGrey} fg={c.grey} icon={18}>
                      <FileText />
                    </IconDot>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500 }}>{t('expenseDetail.note')}</Typography>
                      <Typography sx={{ fontSize: 14, color: c.ink, mt: 0.25, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {selectedExpense!.note}
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
        <DialogTitle sx={{ fontFamily: DISPLAY, pt: 2.25, pb: 0.75, fontSize: '1.05rem' }}>
          <TriangleAlert size={18} color={c.red} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          {t('expense.deleteEntryQ')}
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important', pb: 1 }}>
          <DialogContentText sx={{ color: c.grey, fontSize: 13.5, lineHeight: 1.45 }}>{t('expense.deleteEntryBody')}</DialogContentText>
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

export default ExpenseDetail;
