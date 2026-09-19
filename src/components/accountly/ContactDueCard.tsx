import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CalendarClock } from 'lucide-react';
import { useDispatch } from 'store';
import { setContactDue } from 'store/reducers/accountly/contacts';
import { fetchDashboardStatistics } from 'store/reducers/accountly/dashboard';
import contactService from 'services/accountly/contactService';
import { formatDueDate } from 'utils/accountly/due';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import { AppCard, FormAlert } from './kit';
import DueBadge from './DueBadge';
import DueDateField from './DueDateField';

const ContactDueCard = ({ contactId, dueDate }: { contactId: string; dueDate: string | null }) => {
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(dueDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(dueDate);
    setError(null);
    setEditing(true);
  };

  const save = async (next: string | null) => {
    setSaving(true);
    setError(null);
    try {
      await contactService.updateContact(contactId, { due_date: next });
      dispatch(setContactDue({ contactId, dueDate: next }));
      dispatch(fetchDashboardStatistics() as any);
      setEditing(false);
    } catch (e: any) {
      setError(e?.message || t('due.failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppCard sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <CalendarClock size={18} color={c.greyLight} style={{ flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {dueDate ? (
            <>
              <Typography sx={{ fontWeight: 500, fontSize: 14, color: c.ink }} noWrap>
                {formatDueDate(dueDate)}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <DueBadge dueDate={dueDate} />
              </Box>
            </>
          ) : (
            <Typography sx={{ fontWeight: 500, fontSize: 14, color: c.grey }}>{t('due.set')}</Typography>
          )}
        </Box>
        {!editing && (
          <Box
            component="button"
            type="button"
            onClick={startEditing}
            sx={{
              border: `1.5px solid ${c.border}`,
              bgcolor: c.surface,
              color: c.ink,
              fontWeight: 500,
              fontSize: 13,
              px: 1.75,
              py: 0.75,
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: DISPLAY,
              flexShrink: 0
            }}
          >
            {dueDate ? t('due.change') : t('due.set')}
          </Box>
        )}
      </Stack>

      {editing && (
        <Stack spacing={1.5} sx={{ mt: 1.75 }}>
          <FormAlert message={error} />
          <DueDateField value={draft} onChange={setDraft} label={false} />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" disabled={saving || !draft || draft === dueDate} onClick={() => save(draft)} sx={{ flex: 1 }}>
              {t('due.save')}
            </Button>
            {dueDate && (
              <Button variant="outlined" color="inherit" disabled={saving} onClick={() => save(null)} sx={{ flex: 1 }}>
                {t('due.clear')}
              </Button>
            )}
            <Button variant="text" color="inherit" disabled={saving} onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </Button>
          </Stack>
        </Stack>
      )}
    </AppCard>
  );
};

export default ContactDueCard;
