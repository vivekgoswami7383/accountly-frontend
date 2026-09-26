import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AlarmClock, CalendarDays, CheckCircle2, ChevronRight, Clock, Trash2, TriangleAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import {
  deleteReminder,
  fetchReminderById,
  markReminderDone,
  saveReminder,
  setSelectedReminder,
  snoozeReminder
} from 'store/reducers/accountly/reminders';
import {
  REMINDER_EARLY_MINUTES,
  REMINDER_REPEATS,
  REMINDER_SNOOZE_MINUTES,
  ReminderRepeat,
  ReminderRequest
} from 'services/accountly/types';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import ReminderDatePicker from 'components/accountly/ReminderDatePicker';
import { AppCard, BottomActionBar, FOOTER_SPACE, FormAlert, IconDot, ListRow, Pill, SectionHeader } from 'components/accountly/kit';
import {
  dayLabel,
  dayOffset,
  defaultReminderTime,
  deviceTimezone,
  earliestMinuteOn,
  formatWhen,
  fromMinutes,
  toMinutes,
  toTimeInputValue,
  withTime
} from 'utils/accountly/reminders';
import { formatTime } from 'utils/accountly/format';

const RECENTLY_FIRED_MS = 12 * 60 * 60 * 1000;
const MAX_TITLE = 200;

const ReminderEditor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isNew = !id;
  const c = useAccountlyColors();
  const t = useT();

  const { selected, loadingSelected } = useSelector((s) => s.reminders);
  const reminder = !isNew && selected?._id === id ? selected : null;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [remindAt, setRemindAt] = useState<Date>(() => defaultReminderTime());
  const [repeat, setRepeat] = useState<ReminderRepeat>('none');
  const [earlyMinutes, setEarlyMinutes] = useState<number | null>(null);
  const [timeTouched, setTimeTouched] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const loadedRef = useRef(isNew);

  useEffect(() => {
    if (!isNew && id) {
      loadedRef.current = false;
      dispatch(fetchReminderById(id));
    }
    return () => {
      dispatch(setSelectedReminder(null));
    };
  }, [dispatch, id, isNew]);

  useEffect(() => {
    if (!reminder || loadedRef.current) return;
    setTitle(reminder.title);
    setNotes(reminder.notes || '');
    setRemindAt(new Date(reminder.remind_at));
    setRepeat(reminder.repeat);
    setEarlyMinutes(reminder.early_minutes ?? null);
    setTimeTouched(false);
    loadedRef.current = true;
  }, [reminder]);

  const pickTime = (at: Date) => {
    setRemindAt(at);
    setTimeTouched(true);
    setError(null);
  };

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const timeDay = dayOffset(remindAt) < 0 ? new Date() : remindAt;
  const earliestToday = dayOffset(timeDay) === 0 ? earliestMinuteOn(timeDay) : 0;

  const keepInFuture = (at: Date) => {
    const earliest = earliestMinuteOn(at);
    if (earliest === 0 || earliest >= 24 * 60) return at;
    return withTime(at, fromMinutes(Math.max(toMinutes(toTimeInputValue(at)), earliest)));
  };

  const openTimePicker = () => {
    const input = timeInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) return;
    try {
      if (input.showPicker) input.showPicker();
      else input.focus();
    } catch {
      input.focus();
    }
  };
  const sendsTime = isNew || timeTouched;
  const timeOk = !sendsTime || remindAt.getTime() > clock;

  const run = async (action: () => Promise<{ type: string; payload?: unknown }>, fallback: string) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.type.endsWith('/rejected')) {
      setError((result.payload as string) || fallback);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (busy) return;
    if (!title.trim()) {
      setError(t('reminders.needTitle'));
      titleInputRef.current?.focus();
      return;
    }
    if (sendsTime && remindAt.getTime() <= Date.now()) {
      setClock(Date.now());
      pickTime(keepInFuture(remindAt));
      openTimePicker();
      return;
    }
    const data: Partial<ReminderRequest> = {
      title: title.trim(),
      notes: notes.trim(),
      repeat,
      early_minutes: earlyMinutes,
      timezone: deviceTimezone()
    };
    if (sendsTime) data.remind_at = remindAt.toISOString();
    const ok = await run(() => dispatch(saveReminder({ id, data })), t('reminders.failedSave'));
    if (!ok) return;
    if (isNew) navigate('/reminder', { replace: true });
    else navigate(-1);
  };

  const handleDone = async () => {
    if (!id) return;
    const ok = await run(() => dispatch(markReminderDone(id)), t('reminders.failedUpdate'));
    if (ok) navigate(-1);
  };

  const handleSnooze = async (minutes: number) => {
    if (!id) return;
    const ok = await run(() => dispatch(snoozeReminder({ id, minutes })), t('reminders.failedUpdate'));
    if (ok) navigate(-1);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!id) return;
    const ok = await run(() => dispatch(deleteReminder(id)), t('reminders.failedDelete'));
    if (ok) navigate(-1);
  };

  const lastFired = reminder?.last_fired_at ? new Date(reminder.last_fired_at) : null;
  const justFired =
    reminder?.state === 'fired' ||
    (reminder?.state === 'scheduled' && reminder.repeat !== 'none' && lastFired && Date.now() - lastFired.getTime() < RECENTLY_FIRED_MS);

  const headerRight = reminder ? (
    <IconButton onClick={() => setConfirmDelete(true)} sx={{ color: c.red }} aria-label={t('common.delete')}>
      <Trash2 size={19} />
    </IconButton>
  ) : undefined;

  if (!isNew && !reminder) {
    return (
      <>
        <AppHeader variant="screen" title={t('reminders.reminder')} />
        <Container maxWidth="sm" sx={{ px: 2.25, pt: 4, textAlign: 'center' }}>
          {loadingSelected ? (
            <CircularProgress size={24} sx={{ color: c.red }} />
          ) : (
            <Typography sx={{ color: c.grey, fontSize: 14 }}>{t('reminders.notFound')}</Typography>
          )}
        </Container>
      </>
    );
  }

  return (
    <>
      <AppHeader variant="screen" title={isNew ? t('reminders.new') : t('reminders.reminder')} right={headerRight} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: FOOTER_SPACE }}>
        <Stack spacing={2.5}>
          {error && <FormAlert message={error} />}

          {reminder && justFired && lastFired && (
            <AppCard sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconDot size={40} bg={c.redSoft} fg={c.redDeep}>
                  <AlarmClock />
                </IconDot>
                <Typography sx={{ flex: 1, fontWeight: 500, fontSize: 14, color: c.ink }}>
                  {t('reminders.remindedAt', { when: formatWhen(lastFired.toISOString(), t) })}
                </Typography>
              </Stack>
              <Typography sx={{ color: c.grey, fontSize: 12.5, fontWeight: 500, mt: 1.75, mb: 1 }}>{t('reminders.snooze')}</Typography>
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                {REMINDER_SNOOZE_MINUTES.map((minutes) => (
                  <Pill key={minutes} onClick={() => handleSnooze(minutes)}>
                    {t(`reminders.snooze.${minutes}`)}
                  </Pill>
                ))}
                {reminder.state === 'fired' && (
                  <Pill active onClick={handleDone}>
                    {t('reminders.done')}
                  </Pill>
                )}
              </Stack>
            </AppCard>
          )}

          <AppCard sx={{ px: 2, py: 1.5 }}>
            <TextField
              autoFocus={isNew}
              fullWidth
              multiline
              variant="standard"
              placeholder={t('reminders.titlePlaceholder')}
              value={title}
              inputRef={titleInputRef}
              onChange={(e) => {
                setTitle(e.target.value.replace(/\n/g, ' ').slice(0, MAX_TITLE));
                if (error === t('reminders.needTitle')) setError(null);
              }}
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: 18, lineHeight: 1.4, fontWeight: 600, color: c.ink, fontFamily: DISPLAY }
              }}
            />
            <Divider sx={{ borderColor: c.line, my: 1.25 }} />
            <TextField
              fullWidth
              multiline
              minRows={2}
              variant="standard"
              placeholder={t('reminders.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
              InputProps={{ disableUnderline: true, sx: { fontSize: 14.5, lineHeight: 1.55, color: c.ink, fontFamily: DISPLAY } }}
            />
          </AppCard>

          <Box>
            <SectionHeader title={t('reminders.when')} />
            <AppCard sx={{ overflow: 'hidden' }}>
              <ListRow onClick={() => setDatePickerOpen(true)}>
                <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                  <CalendarDays />
                </IconDot>
                <Typography sx={{ flex: 1, fontWeight: 500, fontSize: 14.5, color: c.ink }}>{t('reminders.date')}</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: timeOk ? c.grey : c.redDeep }}>
                  {dayLabel(remindAt, t)}
                </Typography>
                <ChevronRight size={16} color={c.greyIcon} />
              </ListRow>
              <Divider sx={{ borderColor: c.line, ml: '68px' }} />
              <Box sx={{ position: 'relative' }}>
                <ListRow onClick={openTimePicker} tabIndex={-1}>
                  <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                    <Clock />
                  </IconDot>
                  <Typography sx={{ flex: 1, fontWeight: 500, fontSize: 14.5, color: c.ink }}>{t('reminders.time')}</Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: timeOk ? c.grey : c.redDeep }}>
                    {formatTime(remindAt.toISOString())}
                  </Typography>
                  <ChevronRight size={16} color={c.greyIcon} />
                </ListRow>
                <Box
                  component="input"
                  type="time"
                  ref={timeInputRef}
                  aria-label={t('reminders.time')}
                  value={toTimeInputValue(remindAt)}
                  min={earliestToday > 0 ? fromMinutes(earliestToday) : undefined}
                  onClick={openTimePicker}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.value) pickTime(withTime(timeDay, e.target.value));
                  }}
                  onBlur={() => setRemindAt((at) => keepInFuture(at))}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    border: 0,
                    p: 0,
                    m: 0,
                    cursor: 'pointer',
                    fontSize: 16
                  }}
                />
              </Box>
            </AppCard>
          </Box>

          <Box>
            <SectionHeader title={t('reminders.repeat')} />
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              {REMINDER_REPEATS.map((option) => (
                <Pill key={option} active={repeat === option} onClick={() => setRepeat(option)}>
                  {t(`reminders.repeat.${option}`)}
                </Pill>
              ))}
            </Stack>
          </Box>

          <Box>
            <SectionHeader title={t('reminders.early')} />
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              {[null, ...REMINDER_EARLY_MINUTES].map((option) => (
                <Pill key={option ?? 'none'} active={earlyMinutes === option} onClick={() => setEarlyMinutes(option)}>
                  {t(`reminders.early.${option ?? 'none'}`)}
                </Pill>
              ))}
            </Stack>
          </Box>

          {reminder?.state === 'scheduled' && reminder.repeat === 'none' && (
            <AppCard sx={{ overflow: 'hidden' }}>
              <ListRow onClick={handleDone} disabled={busy}>
                <IconDot size={40} bg={c.greenSoft} fg={c.greenDeep}>
                  <CheckCircle2 />
                </IconDot>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14.5, color: c.ink }}>{t('reminders.markDone')}</Typography>
                  <Typography sx={{ color: c.grey, fontSize: 12.5, mt: 0.25 }}>{t('reminders.markDoneSub')}</Typography>
                </Box>
                <ChevronRight size={16} color={c.greyIcon} />
              </ListRow>
            </AppCard>
          )}
        </Stack>
      </Container>

      <BottomActionBar>
        <Button fullWidth variant="contained" size="large" disabled={busy} onClick={handleSave}>
          {busy ? t('common.saving') : t('reminders.save')}
        </Button>
      </BottomActionBar>

      <ReminderDatePicker
        open={datePickerOpen}
        value={remindAt}
        onClose={() => setDatePickerOpen(false)}
        onConfirm={(day) => {
          const time = Math.max(toMinutes(toTimeInputValue(remindAt)), earliestMinuteOn(day));
          pickTime(withTime(day, fromMinutes(time)));
          setDatePickerOpen(false);
        }}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: DISPLAY, pt: 2.25, pb: 0.75, fontSize: '1.05rem' }}>
          <TriangleAlert size={18} color={c.red} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          {t('reminders.deleteQ')}
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important', pb: 1 }}>
          <DialogContentText sx={{ color: c.grey, fontSize: 13.5, lineHeight: 1.45 }}>{t('reminders.deleteBody')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
          <Button onClick={() => setConfirmDelete(false)} variant="outlined">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReminderEditor;
