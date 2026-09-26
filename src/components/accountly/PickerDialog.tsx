import { ReactNode } from 'react';
import { Dialog, DialogContent, IconButton, Stack } from '@mui/material';
import { X } from 'lucide-react';
import { useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';

const PickerDialog = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) => {
  const c = useAccountlyColors();
  const t = useT();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Stack direction="row" justifyContent="flex-end" sx={{ px: 1, pt: 1 }}>
        <IconButton onClick={onClose} aria-label={t('common.close')} sx={{ color: c.grey }}>
          <X size={20} />
        </IconButton>
      </Stack>
      <DialogContent sx={{ px: 1, pt: 0, pb: 2, display: 'flex', justifyContent: 'center' }}>{children}</DialogContent>
    </Dialog>
  );
};

export default PickerDialog;
