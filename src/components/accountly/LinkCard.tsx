import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link2 } from 'lucide-react';
import { useDispatch } from 'store';
import { setCustomerLink } from 'store/reducers/accountly/customers';
import linkService from 'services/accountly/linkService';
import { Customer } from 'services/accountly/types';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { AppCard, FormAlert, IconDot } from './kit';

const LinkCard = ({ customer }: { customer: Customer }) => {
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAvailable(false);
    if (customer.linkStatus) return undefined;
    let cancelled = false;
    linkService
      .lookup(customer.id)
      .then((res) => {
        if (!cancelled) setAvailable(res.status === 'available');
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.id, customer.linkStatus]);

  const sendRequest = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await linkService.request(customer.id);
      dispatch(setCustomerLink({ customerId: customer.id, linkId: res.link.id, linkStatus: 'pending' }));
    } catch (e: any) {
      setError(e?.message || t('link.failedRequest'));
    } finally {
      setBusy(false);
    }
  };

  const cancelRequest = async () => {
    if (!customer.linkId) return;
    setBusy(true);
    setError(null);
    try {
      await linkService.unlink(customer.linkId);
      dispatch(setCustomerLink({ customerId: customer.id, linkId: null, linkStatus: null }));
    } catch (e: any) {
      setError(e?.message || t('link.failedAction'));
    } finally {
      setBusy(false);
    }
  };

  if (!customer.linkStatus && !available) return null;

  const active = customer.linkStatus === 'active';
  const pending = customer.linkStatus === 'pending';

  return (
    <Stack spacing={1.25}>
      <FormAlert message={error} />
      <AppCard sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconDot size={40} bg={active ? c.greenSoft : c.chipGrey} fg={active ? c.greenDeep : c.slate}>
            <Link2 />
          </IconDot>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 14.5, color: c.ink }}>
              {active ? t('link.activeTitle') : pending ? t('link.pendingTitle') : t('link.availableTitle')}
            </Typography>
            <Typography sx={{ color: c.grey, fontSize: 12.5, lineHeight: 1.4, mt: 0.25 }}>
              {active ? t('link.activeSub') : pending ? t('link.pendingSub') : t('link.availableSub')}
            </Typography>
          </Box>
        </Stack>
        {!active && (
          <Button
            fullWidth
            variant={pending ? 'outlined' : 'contained'}
            disabled={busy}
            onClick={pending ? cancelRequest : sendRequest}
            sx={{ mt: 1.75 }}
          >
            {pending ? t('link.cancelRequest') : t('link.sendRequest')}
          </Button>
        )}
      </AppCard>
    </Stack>
  );
};

export default LinkCard;
