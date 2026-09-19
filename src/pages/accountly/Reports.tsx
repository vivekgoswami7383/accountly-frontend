import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Divider, Container, Drawer, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { SlidersHorizontal, X, Calendar, Phone, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchBusinessReport } from 'store/reducers/accountly/reports';
import { useFormatAmount, formatPhone } from 'utils/accountly/format';
import { DatePreset, getDateRangeForPreset } from 'utils/accountly/dateFilters';
import { AccountlyColors, DISPLAY, shadow, avatarTint, initials, useAccountlyColors, useAccountlyMode } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BalanceTag, Fade, ListRow, SectionHeader } from 'components/accountly/kit';
import { ReportsEmptyIllustration } from 'components/accountly/EmptyIllustration';
import ContactNameLine from 'components/accountly/ContactNameLine';

const SectionLabel = ({ children, c }: { children: ReactNode; c: AccountlyColors }) => (
  <Typography sx={{ fontWeight: 500, fontSize: 11.5, color: c.grey, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.25 }}>
    {children}
  </Typography>
);

const ChipButton = ({ label, active, onClick, c, icon }: { label: string; active: boolean; onClick: () => void; c: AccountlyColors; icon?: ReactNode }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.625,
      border: active ? 'none' : `1.5px solid ${c.border}`,
      bgcolor: active ? c.red : c.surface,
      color: active ? '#fff' : c.ink,
      fontWeight: 500,
      fontSize: 13,
      px: 1.75,
      py: 0.875,
      borderRadius: '999px',
      cursor: 'pointer',
      fontFamily: DISPLAY,
      transition: 'background-color .15s ease, color .15s ease, border-color .15s ease'
    }}
  >
    {icon}
    {label}
  </Box>
);

const StatTile = ({ label, value, color, loading }: { label: string; value: string; color: string; loading?: boolean }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    {loading ? (
      <>
        <Skeleton variant="text" width={70} height={26} />
        <Skeleton variant="text" width={50} height={16} />
      </>
    ) : (
      <>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 19, letterSpacing: '-0.01em', color }} noWrap>
          {value}
        </Typography>
        <Typography sx={{ color: 'inherit', opacity: 0.7, fontSize: 11.5, fontWeight: 500, mt: 0.125 }}>{label}</Typography>
      </>
    )}
  </Box>
);

interface ReportFilters {
  datePreset: DatePreset;
  customStart: string;
  customEnd: string;
}

const DEFAULT_REPORT_FILTERS: ReportFilters = { datePreset: 'month', customStart: '', customEnd: '' };

const Reports = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const mode = useAccountlyMode();
  const t = useT();
  const fmt = useFormatAmount();
  const { report, loading } = useSelector((s) => s.reports);

  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const range = useMemo(
    () => getDateRangeForPreset(appliedFilters.datePreset, appliedFilters.customStart, appliedFilters.customEnd),
    [appliedFilters]
  );

  useEffect(() => {
    if (range) dispatch(fetchBusinessReport({ start: range.start.toISOString(), end: range.end.toISOString() }));
  }, [dispatch, range]);

  const dateOptions: { value: DatePreset; label: string }[] = [
    { value: 'today', label: t('transactions.filterToday') },
    { value: 'yesterday', label: t('transactions.filterYesterday') },
    { value: 'week', label: t('transactions.filterThisWeek') },
    { value: 'month', label: t('transactions.filterThisMonth') },
    { value: 'custom', label: t('transactions.filterCustomRange') }
  ];

  const dateChipLabel = dateOptions.find((o) => o.value === appliedFilters.datePreset)?.label || '';

  const openDrawer = () => {
    setDraftFilters(appliedFilters);
    setDrawerOpen(true);
  };
  const applyDraft = () => {
    setAppliedFilters(draftFilters);
    setDrawerOpen(false);
  };
  const resetDraft = () => setDraftFilters(DEFAULT_REPORT_FILTERS);

  const daily = report?.daily || [];
  const chartSeries = [
    { name: t('reports.collected'), data: daily.map((d) => d.collected) },
    { name: t('reports.given'), data: daily.map((d) => d.given) }
  ];
  const chartOptions: any = {
    chart: { type: 'bar', height: 240, toolbar: { show: false }, background: 'transparent' },
    theme: { mode: mode === 'dark' ? 'dark' : 'light' },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    dataLabels: { enabled: false },
    colors: [c.green, c.red],
    legend: { show: true, fontFamily: DISPLAY, labels: { colors: c.grey } },
    grid: { show: false },
    xaxis: {
      categories: daily.map((d) => d.date.slice(5)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: c.greyLight, fontSize: '10px' } }
    },
    yaxis: { show: false }
  };

  const filterBtn = (
    <IconButton
      onClick={openDrawer}
      sx={{
        width: 40,
        height: 40,
        borderRadius: '12px',
        bgcolor: c.chipGrey,
        color: c.ink
      }}
    >
      <SlidersHorizontal size={18} />
    </IconButton>
  );

  return (
    <>
      <AppHeader variant="screen" title={t('reports.title')} right={filterBtn} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 3 }}>
        <Stack spacing={2.25}>
          <Box
            component="button"
            onClick={openDrawer}
            sx={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 0.625,
              border: 'none',
              bgcolor: c.redSoft,
              color: c.redDeep,
              fontWeight: 500,
              fontSize: 12.5,
              px: 1.5,
              py: 0.75,
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: DISPLAY
            }}
          >
            <Calendar size={13} />
            {dateChipLabel}
          </Box>

          <Fade>
            <AppCard sx={{ p: 2 }}>
              <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: c.line }} />} spacing={1.5}>
                <Box sx={{ color: c.greenDeep }}>
                  <StatTile label={t('reports.collected')} value={fmt(report?.totals.collected || 0)} color={c.greenDeep} loading={loading} />
                </Box>
                <Box sx={{ color: c.redDeep }}>
                  <StatTile label={t('reports.given')} value={fmt(report?.totals.given || 0)} color={c.redDeep} loading={loading} />
                </Box>
                <Box sx={{ color: c.ink }}>
                  <StatTile label={t('reports.net')} value={fmt(report?.totals.net || 0)} color={c.ink} loading={loading} />
                </Box>
              </Stack>
            </AppCard>
          </Fade>

          <Fade delay={0.05}>
            <Box>
              <SectionHeader title={t('reports.trend')} />
              <AppCard sx={{ p: 2, overflow: 'hidden' }}>
                {loading ? (
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '12px' }} />
                ) : daily.length === 0 ? (
                  <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                    <ReportsEmptyIllustration size={72} />
                    <Typography sx={{ fontWeight: 500, fontSize: 14, color: c.ink }}>{t('reports.noDataYet')}</Typography>
                    <Typography sx={{ color: c.grey, fontSize: 12.5 }}>{t('reports.noDataSub')}</Typography>
                  </Stack>
                ) : (
                  <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={240} />
                )}
              </AppCard>
            </Box>
          </Fade>

          {!loading && report && report.topContacts.length > 0 && (
            <Fade delay={0.1}>
              <Box>
                <SectionHeader title={t('reports.topContacts')} />
                <AppCard sx={{ overflow: 'hidden' }}>
                  {report.topContacts.map((cust, i) => {
                    const get = cust.balance < 0;
                    const av = avatarTint(cust.name);
                    return (
                      <Box key={cust.id}>
                        {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                        <ListRow onClick={() => navigate(`/contact/${cust.id}`)}>
                          <Box
                            sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: av.bg, color: av.fg, fontFamily: DISPLAY, fontWeight: 500, fontSize: 14, flexShrink: 0 }}
                          >
                            {initials(cust.name)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <ContactNameLine name={cust.name} linked={cust.linkStatus === 'active'} />
                            <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0, mt: 0.25 }}>
                              <Phone size={12} color={c.greyLight} style={{ flexShrink: 0 }} />
                              <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                                {formatPhone(cust.phone)}
                              </Typography>
                            </Stack>
                          </Box>
                          <Stack alignItems="center" spacing={0.375} sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: get ? c.greenDeep : c.redDeep }} noWrap>
                              {fmt(cust.balance)}
                            </Typography>
                            <BalanceTag tone={get ? 'get' : 'give'} sx={{ alignSelf: 'center' }}>
                              {get ? t('home.youllGet') : t('home.youllGive')}
                            </BalanceTag>
                          </Stack>
                          <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                        </ListRow>
                      </Box>
                    );
                  })}
                </AppCard>
              </Box>
            </Fade>
          )}
        </Stack>
      </Container>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: '28px 28px 0 0', bgcolor: c.bg, boxShadow: shadow.nav, maxHeight: '85vh', overflowY: 'auto' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 4, bgcolor: c.border }} />
        </Box>

        <Box sx={{ px: 2.5, pt: 1, pb: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 18, color: c.ink }}>{t('reports.filters')}</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: c.greyIcon, bgcolor: c.chipGrey }}>
              <X size={16} />
            </IconButton>
          </Stack>

          <SectionLabel c={c}>{t('transactions.dateRangeLabel')}</SectionLabel>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: draftFilters.datePreset === 'custom' ? 2 : 3.5 }}>
            {dateOptions.map((opt) => (
              <ChipButton
                key={opt.value}
                c={c}
                label={opt.label}
                icon={<Calendar size={14} />}
                active={draftFilters.datePreset === opt.value}
                onClick={() => setDraftFilters((f) => ({ ...f, datePreset: opt.value }))}
              />
            ))}
          </Stack>

          {draftFilters.datePreset === 'custom' && (
            <Stack direction="row" spacing={1.5} sx={{ mb: 3.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: c.grey, mb: 0.625, fontWeight: 500 }}>{t('transactions.startDate')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, borderRadius: '12px', border: `1.5px solid ${c.border}`, bgcolor: c.surface, px: 1.25 }}>
                  <Calendar size={15} color={c.greyLight} style={{ flexShrink: 0 }} />
                  <Box
                    component="input"
                    type="date"
                    value={draftFilters.customStart}
                    max={draftFilters.customEnd || undefined}
                    onChange={(e: any) =>
                      setDraftFilters((f) => ({
                        ...f,
                        customStart: e.target.value,
                        customEnd: f.customEnd && e.target.value > f.customEnd ? e.target.value : f.customEnd
                      }))
                    }
                    sx={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', bgcolor: 'transparent', color: c.ink, fontFamily: 'inherit', fontSize: 13.5, py: 1.1 }}
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: c.grey, mb: 0.625, fontWeight: 500 }}>{t('transactions.endDate')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, borderRadius: '12px', border: `1.5px solid ${c.border}`, bgcolor: c.surface, px: 1.25 }}>
                  <Calendar size={15} color={c.greyLight} style={{ flexShrink: 0 }} />
                  <Box
                    component="input"
                    type="date"
                    value={draftFilters.customEnd}
                    min={draftFilters.customStart || undefined}
                    onChange={(e: any) =>
                      setDraftFilters((f) => ({
                        ...f,
                        customEnd: f.customStart && e.target.value < f.customStart ? f.customStart : e.target.value
                      }))
                    }
                    sx={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', bgcolor: 'transparent', color: c.ink, fontFamily: 'inherit', fontSize: 13.5, py: 1.1 }}
                  />
                </Box>
              </Box>
            </Stack>
          )}

          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={resetDraft}>
              {t('common.reset')}
            </Button>
            <Button fullWidth variant="contained" onClick={applyDraft} sx={{ bgcolor: c.red, '&:hover': { bgcolor: c.redDeep } }}>
              {t('common.apply')}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default Reports;
