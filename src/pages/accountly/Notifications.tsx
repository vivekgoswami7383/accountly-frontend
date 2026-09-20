import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { Bell, CalendarClock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchNotifications, markAllNotificationsRead } from 'store/reducers/accountly/notifications';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, IconDot, ListRow } from 'components/accountly/kit';
import { NotificationsEmptyIllustration } from 'components/accountly/EmptyIllustration';

const styleFor = (type: string) => {
  if (type === 'overdue') return { tone: 'late' as const, icon: <CalendarClock /> };
  if (type === 'due_settled') return { tone: 'ok' as const, icon: <CheckCircle2 /> };
  if (type.startsWith('due_')) return { tone: 'due' as const, icon: <CalendarClock /> };
  return { tone: 'info' as const, icon: <Bell /> };
};

const timeAgo = (iso: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const { items, page, hasMore, loading, loadingMore } = useSelector((s) => s.notifications);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    dispatch(fetchNotifications({ page: 1 })).then((result) => {
      if (!active || !fetchNotifications.fulfilled.match(result)) return;
      const fresh = result.payload.notifications.filter((n) => !n.read_at).map((n) => n._id);
      setUnreadIds(fresh);
      if (result.payload.unread_count > 0) dispatch(markAllNotificationsRead());
    });
    return () => {
      active = false;
    };
  }, [dispatch]);

  const loadMore = () => {
    if (hasMore && !loadingMore) dispatch(fetchNotifications({ page: page + 1 }));
  };

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading || loadingMore);

  return (
    <>
      <AppHeader variant="screen" title={t('notifications.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 3 }}>
        {loading ? (
          <AppCard sx={{ overflow: 'hidden' }}>
            {[0, 1, 2].map((i) => (
              <Box key={i}>
                {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="65%" height={20} />
                    <Skeleton variant="text" width="35%" height={16} />
                  </Box>
                </Stack>
              </Box>
            ))}
          </AppCard>
        ) : items.length === 0 ? (
          <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
            <Box sx={{ mb: 1.75 }}>
              <NotificationsEmptyIllustration />
            </Box>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>{t('notifications.emptyTitle')}</Typography>
            <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5, maxWidth: 260, mx: 'auto', lineHeight: 1.5 }}>
              {t('notifications.emptySub')}
            </Typography>
          </AppCard>
        ) : (
          <Fade>
            <AppCard sx={{ overflow: 'hidden' }}>
              {items.map((n, i) => {
                const { tone, icon } = styleFor(n.type);
                const unread = unreadIds.includes(n._id);
                return (
                  <Box key={n._id}>
                    {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                    <ListRow
                      onClick={() => {
                        setUnreadIds((ids) => ids.filter((id) => id !== n._id));
                        if (n.link) navigate(n.link);
                      }}
                      sx={n.link ? undefined : { cursor: 'default' }}
                    >
                      <IconDot
                        size={40}
                        bg={tone === 'late' ? c.redSoft : tone === 'ok' ? c.greenSoft : c.chipGrey}
                        fg={tone === 'late' ? c.redDeep : tone === 'ok' ? c.greenDeep : c.slate}
                      >
                        {icon}
                      </IconDot>
                      <Typography sx={{ flex: 1, minWidth: 0, fontWeight: unread ? 600 : 500, fontSize: 14, color: c.ink, lineHeight: 1.4 }}>
                        {n.message}
                      </Typography>
                      <Stack alignItems="flex-end" spacing={0.75} sx={{ flexShrink: 0, alignSelf: 'flex-start', pt: 0.25 }}>
                        <Typography sx={{ color: c.greyLight, fontSize: 11.5, fontWeight: 500 }}>{timeAgo(n.created_at)}</Typography>
                        {unread ? <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.red }} /> : <Box sx={{ width: 8, height: 8 }} />}
                      </Stack>
                      {n.link && <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />}
                    </ListRow>
                  </Box>
                );
              })}
            </AppCard>
            {hasMore && (
              <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                {loadingMore && <CircularProgress size={22} sx={{ color: c.red }} />}
              </Box>
            )}
          </Fade>
        )}
      </Container>
    </>
  );
};

export default Notifications;
