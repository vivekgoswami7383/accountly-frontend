import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { CalendarClock, ChevronRight } from 'lucide-react';
import useDueNotifications from 'hooks/useDueNotifications';
import useDueText from 'hooks/useDueText';
import { useFormatAmount } from 'utils/accountly/format';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, IconDot, ListRow } from 'components/accountly/kit';
import { NotificationsEmptyIllustration } from 'components/accountly/EmptyIllustration';

const Notifications = () => {
  const navigate = useNavigate();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const dueText = useDueText();
  const { items, loaded, unseenKeys, markAllSeen } = useDueNotifications();
  const initialUnseen = useRef<string[] | null>(null);

  if (loaded && initialUnseen.current === null) initialUnseen.current = unseenKeys;

  useEffect(() => {
    if (loaded) markAllSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <>
      <AppHeader variant="screen" title={t('notifications.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 3 }}>
        {!loaded ? (
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
                const overdue = n.state === 'overdue';
                const unread = initialUnseen.current?.includes(n.key);
                return (
                  <Box key={n.key}>
                    {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                    <ListRow onClick={() => navigate(`/contact/${n.contact.id}`)}>
                      <IconDot size={40} bg={overdue ? c.redSoft : c.chipGrey} fg={overdue ? c.redDeep : c.slate}>
                        <CalendarClock />
                      </IconDot>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: unread ? 600 : 500, fontSize: 14, color: c.ink, lineHeight: 1.35 }}>
                          {t(n.contact.balance < 0 ? 'notifications.owes' : 'notifications.youOwe', { name: n.contact.name, amount: fmt(n.contact.balance) })}
                        </Typography>
                        <Typography sx={{ color: overdue ? c.redDeep : c.greyLight, fontSize: 12.5, fontWeight: 500, mt: 0.25 }}>
                          {dueText(n.dueDate)}
                        </Typography>
                      </Box>
                      {unread && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.red, flexShrink: 0 }} />}
                      <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                    </ListRow>
                  </Box>
                );
              })}
            </AppCard>
          </Fade>
        )}
      </Container>
    </>
  );
};

export default Notifications;
