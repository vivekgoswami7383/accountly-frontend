import { Container, Stack, Typography } from '@mui/material';
import { BarChart3 } from 'lucide-react';
import { c, DISPLAY } from 'themes/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { IconDot } from 'components/accountly/kit';

const Reports = () => (
  <>
    <AppHeader variant="screen" title="Reports" />
    <Container maxWidth="sm" sx={{ px: 2.25 }}>
      <Stack alignItems="center" spacing={2} sx={{ py: 10, textAlign: 'center' }}>
        <IconDot size={72} bg={c.redSoft} fg={c.red}>
          <BarChart3 />
        </IconDot>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>Reports are coming soon</Typography>
        <Typography sx={{ color: c.grey, fontSize: 13.5, maxWidth: 260 }}>
          Detailed statements, date filters and exports will land here.
        </Typography>
      </Stack>
    </Container>
  </>
);

export default Reports;
