import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { ChevronRight, Phone } from 'lucide-react';
import contactService from 'services/accountly/contactService';
import { Contact, DueSummary } from 'services/accountly/types';
import { todayStr } from 'utils/accountly/due';
import { useFormatAmount, formatPhone } from 'utils/accountly/format';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import DueBadge from 'components/accountly/DueBadge';
import { AppCard, Fade, FormAlert, ListRow, SectionHeader } from 'components/accountly/kit';
import { DueEmptyIllustration } from 'components/accountly/EmptyIllustration';

interface DueData {
  summary: DueSummary;
  overdue: Contact[];
  today: Contact[];
  upcoming: Contact[];
}

const Section = ({ title, contacts }: { title: string; contacts: Contact[] }) => {
  const navigate = useNavigate();
  const c = useAccountlyColors();
  const fmt = useFormatAmount();

  if (contacts.length === 0) return null;

  return (
    <Box>
      <SectionHeader title={title} />
      <AppCard sx={{ overflow: 'hidden' }}>
        {contacts.map((cust, i) => {
          const av = avatarTint(cust.name);
          return (
            <Box key={cust.id}>
              {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
              <ListRow onClick={() => navigate(`/contact/${cust.id}`)}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: cust.imageUrl ? 'transparent' : av.bg,
                    color: av.fg,
                    fontFamily: DISPLAY,
                    fontWeight: 500,
                    fontSize: 14,
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  {cust.imageUrl ? (
                    <Box component="img" src={cust.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials(cust.name)
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                    {cust.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0, mt: 0.25 }}>
                    <Phone size={12} color={c.greyLight} style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                      {formatPhone(cust.phone)}
                    </Typography>
                  </Stack>
                </Box>
                <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.greenDeep }} noWrap>
                    {fmt(cust.balance)}
                  </Typography>
                  {cust.dueDate && <DueBadge dueDate={cust.dueDate} />}
                </Stack>
                <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
              </ListRow>
            </Box>
          );
        })}
      </AppCard>
    </Box>
  );
};

const Due = () => {
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const [data, setData] = useState<DueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    contactService
      .getDueContacts(todayStr())
      .then((res) => {
        if (!active) return;
        setData({
          summary: res.summary,
          overdue: contactService.transformContacts(res.overdue),
          today: contactService.transformContacts(res.today),
          upcoming: contactService.transformContacts(res.upcoming)
        });
      })
      .catch((e: any) => {
        if (active) setError(e?.message || t('due.failed'));
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty = data && data.overdue.length + data.today.length + data.upcoming.length === 0;

  return (
    <>
      <AppHeader variant="screen" title={t('due.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 3 }}>
        <Stack spacing={2.25}>
          <FormAlert message={error} />
          {!data && !error ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="55%" height={20} />
                      <Skeleton variant="text" width="35%" height={16} />
                    </Box>
                    <Skeleton variant="text" width={56} height={20} />
                  </Stack>
                </Box>
              ))}
            </AppCard>
          ) : isEmpty ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box sx={{ mb: 1.75 }}>
                <DueEmptyIllustration />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>{t('due.nothing')}</Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('due.nothingSub')}</Typography>
            </AppCard>
          ) : (
            data && (
              <Fade>
                <Stack spacing={2.25}>
                  {data.summary.overdue.count > 0 && (
                    <AppCard sx={{ p: 2, bgcolor: c.redSoft, boxShadow: 'none' }}>
                      <Typography sx={{ color: c.redDeep, fontSize: 12.5, fontWeight: 500 }}>{t('due.totalOverdue')}</Typography>
                      <Typography sx={{ color: c.redDeep, fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, letterSpacing: '-0.02em', mt: 0.25 }}>
                        {fmt(data.summary.overdue.amount)}
                      </Typography>
                      <Typography sx={{ color: c.redDeep, fontSize: 12.5, mt: 0.25 }}>
                        {t('due.summaryOverdue', { count: data.summary.overdue.count })}
                      </Typography>
                    </AppCard>
                  )}
                  <Section title={t('due.overdue')} contacts={data.overdue} />
                  <Section title={t('due.today')} contacts={data.today} />
                  <Section title={t('due.upcoming')} contacts={data.upcoming} />
                </Stack>
              </Fade>
            )
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Due;
