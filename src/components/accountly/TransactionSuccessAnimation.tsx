import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { c, DISPLAY } from 'themes/accountly';

interface Props {
  visible: boolean;
  onComplete: () => void;
}

const TransactionSuccessAnimation = ({ visible, onComplete }: Props) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: c.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: c.green,
                display: 'grid',
                placeItems: 'center',
                mb: 3,
                fontSize: 42,
                color: '#fff',
                boxShadow: '0 16px 40px rgba(31,169,113,0.35)'
              }}
            >
              <Check size={46} color="#fff" strokeWidth={3} />
            </Box>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: c.ink }}>Entry saved</Typography>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionSuccessAnimation;
