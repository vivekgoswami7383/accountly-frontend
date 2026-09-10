import { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
  illustration?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
}

const EmptyState = ({ illustration, title, description, actionLabel, actionIcon, onAction }: EmptyStateProps) => (
  <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 8, px: 3, textAlign: 'center' }}>
    {illustration && <Box component="img" src={illustration} alt="" sx={{ width: 140, height: 140, objectFit: 'contain', mb: 1 }} />}
    <Typography variant="h5" fontWeight={700}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button variant="contained" startIcon={actionIcon} onClick={onAction} sx={{ mt: 2, borderRadius: 3, px: 3, py: 1.25 }}>
        {actionLabel}
      </Button>
    )}
  </Stack>
);

export default EmptyState;
