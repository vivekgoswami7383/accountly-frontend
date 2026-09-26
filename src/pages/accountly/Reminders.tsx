import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ButtonBase, CircularProgress, Container, Divider, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { AlarmClock, Check, CheckCircle2, Plus, Repeat } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchReminders, markReminderDone } from 'store/reducers/accountly/reminders';
import { ApiReminder, ReminderView } from 'services/accountly/types';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, IconDot, ListRow } from 'components/accountly/kit';
import { RemindersEmptyIllustration } from 'components/accountly/EmptyIllustration';
import PushPrompt from 'components/accountly/PushPrompt';
import { ReminderGroup, formatWhen, groupFor } from 'utils/accountly/reminders';

const GROUPS: ReminderGroup[] = ['today', 'tomorrow', 'later'];
const VIEWS: ReminderView[] = ['upcoming', 'past'];

const ReminderRow = ({ reminder, view }: { reminder: ApiReminder; view: ReminderView }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();

  const done = reminder.state === 'done';
  const repeating = reminder.repeat !== 'none';
  const when =
    view === 'upcoming'
      ? formatWhen(reminder.remind_at, t)
      : `${t(`reminders.state.${reminder.state}`)} · ${formatWhen(
          reminder.completed_at || reminder.last_fired_at || reminder.remind_at,
          t
        )}`;

  const complete = () => {
    dispatch(markReminderDone(reminder._id));
  };

  const showCheck = view === 'upcoming' && !repeating;

  return (
    <Box sx={{ position: 'relative' }}>
      <ListRow onClick={() => navigate(`/reminder/${reminder._id}`)} sx={showCheck ? { pr: '64px' } : undefined}>
        <IconDot size={40} bg={done ? c.greenSoft : c.chipGrey} fg={done ? c.greenDeep : c.slate}>
          {done ? <CheckCircle2 /> : repeating ? <Repeat /> : <AlarmClock />}
        </IconDot>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 600, fontSize: 14.5, color: done ? c.grey : c.ink, textDecoration: done ? 'line-through' : 'none' }}
            noWrap
          >
            {reminder.title}
          </Typography>
          <Typography sx={{ color: c.grey, fontSize: 12.5, mt: 0.25 }} noWrap>
            {when}
            {repeating && ` · ${t(`reminders.repeat.${reminder.repeat}`)}`}
          </Typography>
        </Box>
      </ListRow>
      {showCheck && (
        <IconButton
          onClick={complete}
          aria-label={t('reminders.markDone')}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            border: `1.5px solid ${c.border}`,
            width: 32,
            height: 32,
            color: c.greyLight
          }}
        >
          <Check size={16} />
        </IconButton>
      )}
    </Box>
  );
};

const Reminders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const [view, setView] = useState<ReminderView>('upcoming');
  const list = useSelector((s) => s.reminders[view]);

  useEffect(() => {
    dispatch(fetchReminders({ view, page: 1 }));
    const refresh = () => {
      if (document.visibilityState === 'visible') dispatch(fetchReminders({ view, page: 1 }));
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [dispatch, view]);

  const loadMore = () => {
    if (list.hasMore && !list.loadingMore) dispatch(fetchReminders({ view, page: list.page + 1 }));
  };

  const sentinelRef = useInfiniteScroll(loadMore, list.hasMore, list.loading || list.loadingMore);

  const sections =
    view === 'upcoming'
      ? GROUPS.map((group) => ({ key: group, items: list.items.filter((r) => groupFor(r.remind_at) === group) })).filter(
          (section) => section.items.length > 0
        )
      : [{ key: 'past', items: list.items }];

  const addBtn = (
    <Box
      component="button"
      onClick={() => navigate('/reminder/new')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: 'none',
        cursor: 'pointer',
        bgcolor: c.red,
        color: '#fff',
        fontWeight: 500,
        fontSize: 13,
        px: 1.5,
        py: 0.875,
        borderRadius: '999px',
        fontFamily: DISPLAY
      }}
    >
      <Plus size={15} /> {t('common.add')}
    </Box>
  );

  return (
    <>
      <AppHeader variant="screen" title={t('reminders.title')} right={addBtn} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ p: 0.5, borderRadius: '999px', bgcolor: c.chipGrey }}>
            {VIEWS.map((option) => (
              <ButtonBase
                key={option}
                onClick={() => setView(option)}
                sx={{
                  flex: 1,
                  py: 0.875,
                  borderRadius: '999px',
                  fontFamily: DISPLAY,
                  fontWeight: 500,
                  fontSize: 13.5,
                  color: view === option ? c.ink : c.grey,
                  bgcolor: view === option ? c.surface : 'transparent',
                  boxShadow: view === option ? '0 1px 3px rgba(20,23,26,0.08)' : 'none'
                }}
              >
                {t(`reminders.${option}`)}
              </ButtonBase>
            ))}
          </Stack>

          {view === 'upcoming' && <PushPrompt />}

          {list.loading && list.items.length === 0 ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="55%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </AppCard>
          ) : list.items.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box sx={{ mb: 1.75 }}>
                <RemindersEmptyIllustration />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>
                {view === 'upcoming' ? t('reminders.emptyUpcoming') : t('reminders.emptyPast')}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5, maxWidth: 260, mx: 'auto', lineHeight: 1.5 }}>
                {view === 'upcoming' ? t('reminders.emptyUpcomingSub') : t('reminders.emptyPastSub')}
              </Typography>
            </AppCard>
          ) : (
            <Fade>
              <Stack spacing={2}>
                {sections.map((section) => (
                  <Box key={section.key}>
                    {view === 'upcoming' && (
                      <Typography
                        sx={{
                          color: c.grey,
                          fontSize: 12.5,
                          fontWeight: 600,
                          px: 0.5,
                          mb: 0.75,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {t(`reminders.${section.key}`)}
                      </Typography>
                    )}
                    <AppCard sx={{ overflow: 'hidden' }}>
                      {section.items.map((reminder, i) => (
                        <Box key={reminder._id}>
                          {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                          <ReminderRow reminder={reminder} view={view} />
                        </Box>
                      ))}
                    </AppCard>
                  </Box>
                ))}
              </Stack>
              {list.hasMore && (
                <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                  {list.loadingMore && <CircularProgress size={22} sx={{ color: c.red }} />}
                </Box>
              )}
            </Fade>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Reminders;
