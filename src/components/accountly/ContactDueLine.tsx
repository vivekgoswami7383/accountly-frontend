import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CalendarClock, X } from 'lucide-react';
import { useDispatch } from 'store';
import { setContactDue } from 'store/reducers/accountly/contacts';
import { fetchDashboardStatistics } from 'store/reducers/accountly/dashboard';
import contactService from 'services/accountly/contactService';
import { addDays, dueState, todayStr } from 'utils/accountly/due';
import { useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { useDueText } from './DueBadge';

const ContactDueLine = ({ contactId, dueDate, onError }: { contactId: string; dueDate: string | null; onError: (message: string | null) => void }) => {
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const dueText = useDueText();
  const [saving, setSaving] = useState(false);

  const save = async (next: string | null) => {
    setSaving(true);
    onError(null);
    try {
      await contactService.updateContact(contactId, { due_date: next });
      dispatch(setContactDue({ contactId, dueDate: next }));
      dispatch(fetchDashboardStatistics() as any);
    } catch (e: any) {
      onError(e?.message || t('due.failed'));
    } finally {
      setSaving(false);
    }
  };

  const overdue = dueDate ? dueState(dueDate) === 'overdue' : false;
  const color = overdue ? c.redDeep : dueDate ? c.ink : c.greyLight;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1, opacity: saving ? 0.5 : 1 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 0.5, color }}>
        <CalendarClock size={13} style={{ flexShrink: 0 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 500, color }} noWrap>
          {dueDate ? dueText(dueDate) : t('due.setDate')}
        </Typography>
        <Box
          component="input"
          type="date"
          value={dueDate || ''}
          min={addDays(todayStr(), 1)}
          disabled={saving}
          onChange={(e: any) => e.target.value && save(e.target.value)}
          sx={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}
        />
      </Box>
      {dueDate && (
        <Box component="button" type="button" aria-label="Remove due date" disabled={saving} onClick={() => save(null)} sx={{ display: 'flex', border: 'none', bgcolor: 'transparent', color: c.greyLight, cursor: 'pointer', p: 0.5 }}>
          <X size={13} />
        </Box>
      )}
    </Stack>
  );
};

export default ContactDueLine;
