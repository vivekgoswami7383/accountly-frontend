import { useEffect, useState } from 'react';
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
  Stack,
  Typography
} from '@mui/material';
import { SquarePen, Trash2, ChevronRight, TriangleAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchCustomers, deleteCustomer } from 'store/reducers/accountly/customers';
import useSnackbar from 'hooks/useSnackbar';
import { useFormatAmount, formatPhone } from 'utils/accountly/format';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, ListRow, IconDot, SectionHeader } from 'components/accountly/kit';

const CustomerSettings = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { showSnackbar } = useSnackbar();
  const { customers } = useSelector((s) => s.customers);
  const [confirm, setConfirm] = useState(false);

  const customer = customers.find((x) => x.id === id);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  const handleDelete = async () => {
    setConfirm(false);
    const result = await dispatch(deleteCustomer(id));
    if (deleteCustomer.fulfilled.match(result)) navigate('/customer');
    else showSnackbar({ message: (result.payload as string) || t('customerSettings.failedDelete'), type: 'error' });
  };

  if (!customer) {
    return (
      <>
        <AppHeader variant="screen" title={t('customerSettings.title')} />
        <Container maxWidth="sm" sx={{ px: 2.25, pt: 3 }}>
          <Typography color="text.secondary">{t('customerSettings.notFound')}</Typography>
        </Container>
      </>
    );
  }

  const rows: [string, string, boolean?][] = [
    [t('common.name'), customer.name],
    [t('common.phone'), formatPhone(customer.phone)],
    [t('common.balance'), fmt(customer.balance), true]
  ];

  return (
    <>
      <AppHeader variant="screen" title={t('customerSettings.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 4 }}>
        <Stack spacing={2.5}>
          <Box>
            <SectionHeader title={t('common.details')} />
            <AppCard sx={{ px: 2, py: 0.5 }}>
              {rows.map(([label, value, isBalance], i) => (
                <Box key={label}>
                  {i > 0 && <Divider sx={{ borderColor: c.line }} />}
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 1.5 }}>
                    <Typography sx={{ color: c.grey, fontWeight: 500, fontSize: 13.5 }}>{label}</Typography>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: 13.5, color: isBalance ? (customer.balance < 0 ? c.greenDeep : c.redDeep) : c.ink }}
                    >
                      {value}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </AppCard>
          </Box>

          <Box>
            <SectionHeader title={t('customerSettings.actions')} />
            <AppCard sx={{ overflow: 'hidden' }}>
              <ListRow onClick={() => navigate(`/customer/${id}/edit`)}>
                <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                  <SquarePen />
                </IconDot>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: c.ink }}>{t('customerSettings.editCustomer')}</Typography>
                  <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500 }}>{t('customerSettings.editCustomerSub')}</Typography>
                </Box>
                <ChevronRight size={16} color={c.greyIcon} />
              </ListRow>
              <Divider sx={{ borderColor: c.line, ml: '68px' }} />
              <ListRow onClick={() => setConfirm(true)}>
                <IconDot size={40} bg={c.redSoft} fg={c.red}>
                  <Trash2 />
                </IconDot>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: c.red }}>{t('customerSettings.deleteCustomer')}</Typography>
                  <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500 }}>{t('customerSettings.deleteCustomerSub')}</Typography>
                </Box>
                <ChevronRight size={16} color={c.greyIcon} />
              </ListRow>
            </AppCard>
          </Box>
        </Stack>
      </Container>

      <Dialog open={confirm} onClose={() => setConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: DISPLAY }}>
          <TriangleAlert size={18} color={c.red} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          {t('customerSettings.deleteQ')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: c.grey }}>{t('customerSettings.deleteBody', { name: customer.name })}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirm(false)} variant="outlined">
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

export default CustomerSettings;
