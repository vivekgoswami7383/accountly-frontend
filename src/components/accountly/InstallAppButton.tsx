import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { Download, ChevronRight, Smartphone } from 'lucide-react';
import useInstallApp from 'hooks/useInstallApp';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { IconDot, ListRow } from './kit';

const InstallAppButton = ({ variant }: { variant: 'card' | 'row' }) => {
  const c = useAccountlyColors();
  const t = useT();
  const { mode, install } = useInstallApp();
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!mode) return null;

  const handleClick = () => {
    if (mode === 'native') install();
    else setShowSteps(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
    } catch (error) {
      setCopied(false);
    }
  };

  const steps = mode === 'samsung' ? ['install.samsungStep1', 'install.samsungStep2', 'install.samsungStep3'] : ['install.step1', 'install.step2', 'install.step3'];

  return (
    <>
      {variant === 'row' ? (
        <ListRow onClick={handleClick}>
          <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
            <Download />
          </IconDot>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 500, fontSize: 14, color: c.ink }}>{t('install.button')}</Typography>
            <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500 }}>{t('install.desc')}</Typography>
          </Box>
          <ChevronRight size={16} color={c.greyIcon} />
        </ListRow>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            pl: 1.75,
            borderRadius: '18px',
            bgcolor: c.surface,
            border: `1px solid ${c.border}`
          }}
        >
          <IconDot size={42} bg={c.redSoft} fg={c.red}>
            <Smartphone />
          </IconDot>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 14, color: c.ink, lineHeight: 1.25 }} noWrap>
              {t('install.cardTitle')}
            </Typography>
            <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500, mt: 0.25 }} noWrap>
              {t('install.cardSub')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleClick}
            sx={{ flexShrink: 0, px: 2.25, py: 0.875, minHeight: 0, borderRadius: '999px', fontSize: 13.5, boxShadow: 'none' }}
          >
            {t('install.action')}
          </Button>
        </Box>
      )}

      <Dialog open={showSteps} onClose={() => setShowSteps(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: DISPLAY, fontSize: '1.05rem', pb: 1 }}>{t(mode === 'samsung' ? 'install.samsungTitle' : 'install.iosTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            {steps.map((key, index) => (
              <Stack key={key} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: c.chipGrey,
                    color: c.ink,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12.5,
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ fontSize: 14, color: c.ink, lineHeight: 1.5 }}>{t(key)}</Typography>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          {mode === 'samsung' && (
            <Button variant="outlined" onClick={copyLink}>
              {t(copied ? 'install.copied' : 'install.copyLink')}
            </Button>
          )}
          <Button variant="contained" onClick={() => setShowSteps(false)}>
            {t('install.gotIt')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallAppButton;
