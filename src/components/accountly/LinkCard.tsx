import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link2 } from 'lucide-react';
import { useDispatch } from 'store';
import { refreshAfterLinkChange, setCustomerLink } from 'store/reducers/accountly/customers';
import linkService from 'services/accountly/linkService';
import { Customer } from 'services/accountly/types';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { AppCard, FormAlert, IconDot } from './kit';

type LookupState = { status: 'available' | 'incoming'; linkId?: string } | null;

const LinkCard = ({ customer }: { customer: Customer }) => {
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const [lookup, setLookup] = useState<LookupState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLookup(null);
    if (customer.linkStatus) return undefined;
    let cancelled = false;
    linkService
      .lookup(customer.id)
      .then((res) => {
        if (cancelled) return;
        if (res.status === 'available') setLookup({ status: 'available' });
        else if (res.status === 'incoming') setLookup({ status: 'incoming', linkId: res.link_id });
      })
      .catch(() => {
        if (!cancelled) setLookup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.id, customer.linkStatus]);

  const run = async (action: () => Promise<void>, failMessage: string) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e: any) {
      setError(e?.message || failMessage);
    } finally {
      setBusy(false);
    }
  };

  const sendRequest = () =>
    run(async () => {
      const res = await linkService.request(customer.id);
      dispatch(setCustomerLink({ customerId: customer.id, linkId: res.link.id, linkStatus: 'pending' }));
    }, t('link.failedRequest'));

  const cancelRequest = () =>
    run(async () => {
      if (!customer.linkId) return;
      await linkService.unlink(customer.linkId);
      dispatch(setCustomerLink({ customerId: customer.id, linkId: null, linkStatus: null }));
    }, t('link.failedAction'));

  const acceptIncoming = () =>
    run(async () => {
      if (!lookup?.linkId) return;
      await linkService.accept(lookup.linkId);
      dispatch(setCustomerLink({ customerId: customer.id, linkId: lookup.linkId, linkStatus: 'active' }));
      dispatch(refreshAfterLinkChange());
    }, t('link.failedAction'));

  const declineIncoming = () =>
    run(async () => {
      if (!lookup?.linkId) return;
      await linkService.decline(lookup.linkId);
      setLookup(null);
      dispatch(refreshAfterLinkChange());
    }, t('link.failedAction'));

  const pending = customer.linkStatus === 'pending';
  const incoming = !customer.linkStatus && lookup?.status === 'incoming';
  const available = !customer.linkStatus && lookup?.status === 'available';

  if (customer.linkStatus === 'active' || !(pending || incoming || available)) return null;

  const title = pending ? t('link.pendingTitle') : incoming ? t('link.incomingTitle') : t('link.availableTitle');
  const sub = pending ? t('link.pendingSub') : incoming ? t('link.incomingSub') : t('link.availableSub');

  return (
    <Stack spacing={1.25}>
      <FormAlert message={error} />
      <AppCard sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
            <Link2 />
          </IconDot>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 14.5, color: c.ink }}>{title}</Typography>
            <Typography sx={{ color: c.grey, fontSize: 12.5, lineHeight: 1.4, mt: 0.25 }}>{sub}</Typography>
          </Box>
        </Stack>
        {incoming ? (
          <Stack direction="row" spacing={1.25} sx={{ mt: 1.75 }}>
            <Button fullWidth variant="outlined" disabled={busy} onClick={declineIncoming}>
              {t('link.decline')}
            </Button>
            <Button fullWidth variant="contained" disabled={busy} onClick={acceptIncoming}>
              {t('link.accept')}
            </Button>
          </Stack>
        ) : (
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
