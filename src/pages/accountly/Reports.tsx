import { Container, Stack, Typography } from '@mui/material';
import { BarChart3 } from 'lucide-react';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { IconDot } from 'components/accountly/kit';

const Reports = () => {
  const c = useAccountlyColors();
  const t = useT();
  return (
    <>
      <AppHeader variant="screen" title={t('reports.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25 }}>
        <Stack alignItems="center" spacing={2} sx={{ py: 10, textAlign: 'center' }}>
          <IconDot size={72} bg={c.redSoft} fg={c.red}>
            <BarChart3 />
          </IconDot>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 18 }}>{t('reports.comingSoon')}</Typography>
          <Typography sx={{ color: c.grey, fontSize: 13.5, maxWidth: 260 }}>{t('reports.comingSoonSub')}</Typography>
        </Stack>
      </Container>
    </>
  );
};

export default Reports;
