import { Box, Card, Typography, alpha, useTheme } from '@mui/material';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Transaction } from 'services/accountly/types';
import { formatDate, formatTime } from 'utils/accountly/format';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: (t: Transaction) => void;
  showDate?: boolean;
  showTime?: boolean;
}

const TransactionCard = ({ transaction, onClick, showDate = true, showTime = true }: TransactionCardProps) => {
  const theme = useTheme();
  const isSent = transaction.transaction_type === 'sent';
  const color = isSent ? theme.palette.error.main : theme.palette.success.main;

  let meta = '';
  if (showDate && showTime) meta = `${formatDate(transaction.createdAt)} • ${formatTime(transaction.createdAt)}`;
  else if (showDate) meta = formatDate(transaction.createdAt);
  else if (showTime) meta = formatTime(transaction.createdAt);

  return (
    <Card
      onClick={() => onClick?.(transaction)}
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color .15s ease',
        '&:hover': onClick ? { bgcolor: alpha(theme.palette.primary.main, 0.06) } : undefined
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.15),
          color
        }}
      >
        {isSent ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {isSent ? `You Gave ₹${transaction.amount}` : `You Got ₹${transaction.amount}`}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {isSent ? 'to' : 'from'} {transaction.customerName}
        </Typography>
        {meta && (
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {meta}
          </Typography>
        )}
      </Box>

      <Box sx={{ color, fontSize: 22, display: 'flex', flexShrink: 0 }}>
        {isSent ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      </Box>
    </Card>
  );
};

export default TransactionCard;
