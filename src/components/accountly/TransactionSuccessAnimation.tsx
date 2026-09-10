import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { CheckOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  visible: boolean;
  onComplete: () => void;
}

const TransactionSuccessAnimation = ({ visible, onComplete }: Props) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onComplete, 2500);
    return () => clearTimeout(t);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: '#1A1A1A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: '#34C759',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                fontSize: 44,
                color: '#fff'
              }}
            >
              <CheckOutlined />
            </Box>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
              Transaction Saved
            </Typography>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionSuccessAnimation;
