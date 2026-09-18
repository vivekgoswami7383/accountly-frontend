import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { Link2 } from 'lucide-react';
import { useDispatch } from 'store';
import { refreshAfterLinkChange } from 'store/reducers/accountly/customers';
import linkService from 'services/accountly/linkService';
import { BlockedLink, LinkRequest } from 'services/accountly/types';
import { formatDate } from 'utils/accountly/format';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, FormAlert, IconDot } from 'components/accountly/kit';
import { CustomersEmptyIllustration } from 'components/accountly/EmptyIllustration';

const LinkRequests = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const [requests, setRequests] = useState<LinkRequest[] | null>(null);
  const [blocked, setBlocked] = useState<BlockedLink[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    linkService
      .incoming()
      .then(setRequests)
      .catch((e: any) => {
        setRequests([]);
        setError(e?.message || t('link.failedAction'));
      });
    linkService
      .blocked()
      .then(setBlocked)
      .catch(() => setBlocked([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeRequest = (id: string) => setRequests((list) => (list || []).filter((r) => r.id !== id));

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      removeRequest(id);
    } catch (e: any) {
      setError(e?.message || t('link.failedAction'));
    } finally {
      setBusyId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await linkService.unblock(id);
      setBlocked((list) => list.filter((b) => b.id !== id));
    } catch (e: any) {
      setError(e?.message || t('link.failedAction'));
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = (id: string) =>
    run(id, async () => {
      const { customer_id: customerId } = await linkService.accept(id);
      dispatch(refreshAfterLinkChange());
      navigate(`/customer/${customerId}`);
    });

  return (
    <>
      <AppHeader variant="screen" title={t('link.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 4 }}>
        <Stack spacing={1.5}>
          <FormAlert message={error} />
          {requests === null ? (
            <AppCard sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" height={22} />
              <Skeleton variant="text" width="40%" height={16} />
            </AppCard>
          ) : requests.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box sx={{ mb: 1.75 }}>
                <CustomersEmptyIllustration />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>{t('link.noRequests')}</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('link.noRequestsSub')}</Typography>
            </AppCard>
          ) : (
            requests.map((req) => (
              <AppCard key={req.id} sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                    <Link2 />
                  </IconDot>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 14.5, color: c.ink, wordBreak: 'break-word' }}>
                      {t('link.wantsToLink', { name: req.business_name })}
                    </Typography>
                    <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500, mt: 0.25 }}>{formatDate(req.requested_at)}</Typography>
                  </Box>
                </Stack>
                <Typography sx={{ color: c.grey, fontSize: 12.5, lineHeight: 1.45, mt: 1.5 }}>{t('link.requestExplain')}</Typography>
                <Stack direction="row" spacing={1.25} sx={{ mt: 1.75 }}>
                  <Button fullWidth variant="outlined" disabled={busyId === req.id} onClick={() => run(req.id, () => linkService.decline(req.id))}>
                    {t('link.decline')}
                  </Button>
                  <Button fullWidth variant="contained" disabled={busyId === req.id} onClick={() => handleAccept(req.id)}>
                    {t('link.accept')}
                  </Button>
                </Stack>
                <Divider sx={{ borderColor: c.line, my: 1.5 }} />
                <Button
                  size="small"
                  disabled={busyId === req.id}
                  onClick={() =>
                    run(req.id, async () => {
                      await linkService.block(req.id);
                      setBlocked((list) => [{ id: req.id, business_name: req.business_name, blocked_at: new Date().toISOString() }, ...list]);
                    })
                  }
                  sx={{ color: c.grey, fontWeight: 500, p: 0, minWidth: 0 }}
                >
                  {t('link.block')}
                </Button>
              </AppCard>
            ))
          )}

          {blocked.length > 0 && (
            <Box sx={{ pt: 1.5 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 11.5, color: c.grey, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.25, px: 0.5 }}>
                {t('link.blockedTitle')}
              </Typography>
              <AppCard sx={{ overflow: 'hidden' }}>
                {blocked.map((item, i) => (
                  <Box key={item.id}>
                    {i > 0 && <Divider sx={{ borderColor: c.line }} />}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
                      <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 14, color: c.ink, wordBreak: 'break-word' }}>
                        {item.business_name}
                      </Typography>
                      <Button size="small" variant="outlined" disabled={busyId === item.id} onClick={() => handleUnblock(item.id)} sx={{ flexShrink: 0 }}>
                        {t('link.unblock')}
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </AppCard>
            </Box>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default LinkRequests;
