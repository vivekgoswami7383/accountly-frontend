import { useEffect, useRef, useState } from 'react';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { useDispatch } from 'store';
import { fetchContactTransactions } from 'store/reducers/accountly/transactions';
import { refreshAfterLinkChange } from 'store/reducers/accountly/contacts';
import linkService from 'services/accountly/linkService';
import { Contact, LinkImportStatus as ImportStatus } from 'services/accountly/types';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { AppCard, IconDot } from './kit';

const POLL_MS = 2500;

const LinkImportStatus = ({ contact }: { contact: Contact }) => {
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const wasRunning = useRef(false);
  const linkId = contact.linkStatus === 'active' ? contact.linkId : null;

  useEffect(() => {
    wasRunning.current = false;
    setStatus(null);
    if (!linkId) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const next = await linkService.importStatus(linkId);
        if (cancelled) return;
        setStatus(next);
        if (next.status === 'running') {
          wasRunning.current = true;
          timer = setTimeout(poll, POLL_MS);
        } else if (wasRunning.current && next.status === 'done') {
          wasRunning.current = false;
          dispatch(fetchContactTransactions(contact.id));
          dispatch(refreshAfterLinkChange());
        }
      } catch {
        if (!cancelled) setStatus(null);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId]);

  const retry = async () => {
    if (!linkId) return;
    await linkService.retryImport(linkId).catch(() => undefined);
    const next = await linkService.importStatus(linkId).catch(() => null);
    setStatus(next);
  };

  if (!status || (status.status !== 'running' && status.status !== 'failed')) return null;

  const running = status.status === 'running';
  const percent = status.total > 0 ? Math.min(100, Math.round((status.done / status.total) * 100)) : 0;

  return (
    <AppCard sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
          <RefreshCw />
        </IconDot>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 14.5, color: running ? c.ink : c.redDeep }}>
            {running ? t('link.importing') : t('link.importFailed')}
          </Typography>
          {running && (
            <Typography sx={{ color: c.grey, fontSize: 12.5, mt: 0.25 }}>{t('link.importingProgress', { done: status.done, total: status.total })}</Typography>
          )}
        </Box>
        {!running && status.can_retry && (
          <Button size="small" variant="outlined" onClick={retry}>
            {t('link.retry')}
          </Button>
        )}
      </Stack>
      {running && <LinearProgress variant={status.total > 0 ? 'determinate' : 'indeterminate'} value={percent} sx={{ mt: 1.5, borderRadius: 4, height: 6 }} />}
    </AppCard>
  );
};

export default LinkImportStatus;
