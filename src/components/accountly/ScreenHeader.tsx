import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface ScreenHeaderProps {
  title?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
}

const ScreenHeader = ({ title, onBack, right, children }: ScreenHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, minHeight: 44 }}>
      <IconButton onClick={onBack || (() => navigate(-1))} sx={{ ml: -1 }} aria-label="back">
        <ArrowLeftOutlined />
      </IconButton>
      {children ? (
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      ) : (
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1, minWidth: 0 }} noWrap>
          {title}
        </Typography>
      )}
      {right}
    </Stack>
  );
};

export default ScreenHeader;
