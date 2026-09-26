import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { BellRing } from 'lucide-react';
import { useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { AppCard, IconDot } from './kit';
import { PushStatus, enablePush, getPushStatus } from 'utils/accountly/push';

export const usePushStatus = () => {
  const [status, setStatus] = useState<PushStatus | null>(null);

  useEffect(() => {
    let active = true;
    getPushStatus()
      .then((next) => active && setStatus(next))
      .catch(() => active && setStatus('unsupported'));
    return () => {
      active = false;
    };
  }, []);

  return [status, setStatus] as const;
};

const PushPrompt = () => {
  const c = useAccountlyColors();
  const t = useT();
  const [status, setStatus] = usePushStatus();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!status || status === 'on' || status === 'unsupported') return null;

  const turnOn = async () => {
    setBusy(true);
    setFailed(false);
    try {
      setStatus(await enablePush());
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppCard sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <IconDot size={40} bg={c.redSoft} fg={c.redDeep}>
          <BellRing />
        </IconDot>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: c.ink }}>{t('push.title')}</Typography>
          <Typography sx={{ color: c.grey, fontSize: 12.5, mt: 0.25, lineHeight: 1.45 }}>
            {failed ? t('push.failed') : t(`push.${status}Body`)}
          </Typography>
          {status === 'off' && (
            <Button variant="contained" size="small" onClick={turnOn} disabled={busy} sx={{ mt: 1.25 }}>
              {t('push.turnOn')}
            </Button>
          )}
        </Box>
      </Stack>
    </AppCard>
  );
};

export default PushPrompt;
