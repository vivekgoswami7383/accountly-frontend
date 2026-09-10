import { Box, Stack, Typography } from '@mui/material';
import { BarChartOutlined } from '@ant-design/icons';
import ScreenHeader from 'components/accountly/ScreenHeader';

const Reports = () => (
  <Box sx={{ maxWidth: 560, mx: 'auto' }}>
    <ScreenHeader title="Reports" />
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 10, textAlign: 'center' }}>
      <BarChartOutlined style={{ fontSize: 56, opacity: 0.4 }} />
      <Typography variant="h5" fontWeight={700}>
        Reports
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This screen will be implemented soon
      </Typography>
    </Stack>
  </Box>
);

export default Reports;
