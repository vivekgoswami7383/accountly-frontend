import { useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { useDispatch } from 'store';
import { setContactDue } from 'store/reducers/accountly/contacts';
import contactService from 'services/accountly/contactService';
import useDueText from 'hooks/useDueText';
import { dueState, formatDueShort } from 'utils/accountly/due';
import DueDatePicker from './DueDatePicker';
import { useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';

const ContactDueRow = ({ contactId, dueDate, onError }: { contactId: string; dueDate: string | null; onError: (message: string | null) => void }) => {
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const dueText = useDueText();
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const save = async (next: string | null) => {
    setSaving(true);
    onError(null);
    try {
      await contactService.updateContact(contactId, { due_date: next });
      dispatch(setContactDue({ contactId, dueDate: next }));
    } catch (e: any) {
      onError(e?.message || t('due.failed'));
    } finally {
      setSaving(false);
    }
  };

  const overdue = dueDate ? dueState(dueDate) === 'overdue' : false;

  return (
    <>
      <Divider sx={{ borderColor: c.line }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5, opacity: saving ? 0.5 : 1 }}>
        <Typography sx={{ color: c.grey, fontWeight: 500, fontSize: 13.5 }}>{t('due.add')}</Typography>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box component="button" type="button" disabled={saving} onClick={() => setPicking(true)} sx={{ border: 'none', bgcolor: 'transparent', p: 0, cursor: 'pointer', textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 500, fontSize: 13.5, color: overdue ? c.redDeep : dueDate ? c.ink : c.red }}>
              {dueDate ? `${formatDueShort(dueDate)} · ${dueText(dueDate)}` : t('due.setDate')}
            </Typography>
          </Box>
          {dueDate && (
            <Box
              component="button"
              type="button"
              aria-label="Remove due date"
              disabled={saving}
              onClick={() => save(null)}
              sx={{ display: 'flex', border: 'none', bgcolor: 'transparent', color: c.greyLight, cursor: 'pointer', p: 0.5 }}
            >
              <X size={14} />
            </Box>
          )}
        </Stack>
      </Stack>
      <DueDatePicker
        open={picking}
        value={dueDate}
        onClose={() => setPicking(false)}
        onConfirm={(date) => {
          setPicking(false);
          save(date);
        }}
      />
    </>
  );
};

export default ContactDueRow;
