import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Divider, Drawer, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Search, ArrowUp, ArrowDown, SlidersHorizontal, X, Calendar, ListFilter } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchTransactions } from 'store/reducers/accountly/transactions';
import { useFormatAmount } from 'utils/accountly/format';
import { AppliedFilters, DatePreset, DEFAULT_FILTERS, TypeFilter, getDateRangeForPreset } from 'utils/accountly/dateFilters';
import { FilterCondition, TransactionFilter } from 'services/accountly/types';
import { AccountlyColors, DISPLAY, shadow, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, ListRow, IconDot } from 'components/accountly/kit';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '');
};

const buildFilter = (filters: AppliedFilters): TransactionFilter | undefined => {
  const conditions: FilterCondition[] = [];
  const range = getDateRangeForPreset(filters.datePreset, filters.customStart, filters.customEnd);
  if (range) {
    conditions.push({ field_name: 'created_at', operator: 'between', field_value: [range.start.toISOString(), range.end.toISOString()] });
  }
  if (filters.type !== 'all') {
    conditions.push({ field_name: 'transaction_type', operator: 'exactmatch', field_value: filters.type });
  }
  if (conditions.length === 0) return undefined;
  return { search: [conditions] };
};

const FilterChip = ({ label, onClear, c }: { label: string; onClear?: () => void; c: AccountlyColors }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1.25,
      py: 0.625,
      borderRadius: '999px',
      bgcolor: c.chipGrey,
      color: c.slate,
      fontSize: 12.5,
      fontWeight: 700,
      whiteSpace: 'nowrap'
    }}
  >
    {label}
    {onClear && (
      <Box
        component="button"
        onClick={onClear}
        sx={{ display: 'flex', border: 'none', bgcolor: 'transparent', cursor: 'pointer', p: 0, color: c.slate }}
      >
        <X size={13} />
      </Box>
    )}
  </Box>
);

const SectionLabel = ({ children, c }: { children: ReactNode; c: AccountlyColors }) => (
  <Typography sx={{ fontWeight: 700, fontSize: 11.5, color: c.grey, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.25 }}>
    {children}
  </Typography>
);

const ChipButton = ({
  label,
  active,
  onClick,
  c,
  icon
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  c: AccountlyColors;
  icon?: ReactNode;
}) => (
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
      fontWeight: 700,
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

const Transactions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { transactions, loading } = useSelector((s) => s.transactions);
  const [query, setQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<AppliedFilters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions(buildFilter(appliedFilters)));
  }, [dispatch, appliedFilters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (tx) => tx.customerName?.toLowerCase().includes(q) || tx.description?.toLowerCase().includes(q) || String(tx.amount).includes(q)
    );
  }, [transactions, query]);

  const hasNonDefaultFilter = appliedFilters.datePreset !== 'today' || appliedFilters.type !== 'all';

  const dateOptions: { value: DatePreset; label: string }[] = [
    { value: 'today', label: t('transactions.filterToday') },
    { value: 'yesterday', label: t('transactions.filterYesterday') },
    { value: 'week', label: t('transactions.filterThisWeek') },
    { value: 'month', label: t('transactions.filterThisMonth') },
    { value: 'all', label: t('transactions.filterAllTime') },
    { value: 'custom', label: t('transactions.filterCustomRange') }
  ];

  const typeOptions: { value: TypeFilter; label: string; icon?: ReactNode }[] = [
    { value: 'all', label: t('transactions.filterAllTypes'), icon: <ListFilter size={14} /> },
    { value: 'debit', label: t('detail.youGaveBtn'), icon: <ArrowUp size={14} /> },
    { value: 'credit', label: t('detail.youGotBtn'), icon: <ArrowDown size={14} /> }
  ];

  const dateChipLabel = dateOptions.find((o) => o.value === appliedFilters.datePreset)?.label || '';
  const typeChipLabel = typeOptions.find((o) => o.value === appliedFilters.type)?.label || '';

  const openDrawer = () => {
    setDraftFilters(appliedFilters);
    setDrawerOpen(true);
  };

  const applyDraft = () => {
    setAppliedFilters(draftFilters);
    setDrawerOpen(false);
  };

  const resetDraft = () => setDraftFilters(DEFAULT_FILTERS);

  return (
    <>
      <AppHeader variant="root" title={t('transactions.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder={t('transactions.searchPayments')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={c.greyLight} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '16px', boxShadow: '0 1px 2px rgba(20,23,26,0.03)' }
              }}
            />
            <IconButton
              onClick={openDrawer}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: hasNonDefaultFilter ? c.redSoft : c.surface,
                color: hasNonDefaultFilter ? c.red : c.ink,
                boxShadow: '0 1px 2px rgba(20,23,26,0.03)',
                flexShrink: 0
              }}
            >
              <SlidersHorizontal size={19} />
            </IconButton>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <FilterChip
              c={c}
              label={dateChipLabel}
              onClear={
                appliedFilters.datePreset !== 'today'
                  ? () => setAppliedFilters((f) => ({ ...f, datePreset: 'today', customStart: '', customEnd: '' }))
                  : undefined
              }
            />
            {appliedFilters.type !== 'all' && (
              <FilterChip c={c} label={typeChipLabel} onClear={() => setAppliedFilters((f) => ({ ...f, type: 'all' }))} />
            )}
          </Stack>

          {loading ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="55%" height={20} />
                      <Skeleton variant="text" width="30%" height={16} />
                    </Box>
                    <Skeleton variant="text" width={56} height={20} />
                  </Stack>
                </Box>
              ))}
            </AppCard>
          ) : filtered.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box component="img" src={onlinePayment} alt="" sx={{ width: 100, height: 100, objectFit: 'contain', mb: 1.75, opacity: 0.95 }} />
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
                {query || hasNonDefaultFilter ? t('customers.noMatches') : t('home.noPaymentsYet')}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('transactions.openCustomerRecord')}</Typography>
            </AppCard>
          ) : (
            <Fade>
              <AppCard sx={{ overflow: 'hidden' }}>
                {filtered.map((tx, i) => {
                  const sent = tx.transaction_type === 'debit';
                  return (
                    <Box key={tx.id}>
                      {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                      <ListRow onClick={() => navigate(`/transaction/${tx.id}`)}>
                        <IconDot size={44} bg={sent ? c.redSoft : c.greenSoft} fg={sent ? c.redDeep : c.greenDeep}>
                          {sent ? <ArrowUp /> : <ArrowDown />}
                        </IconDot>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: c.ink }} noWrap>
                            {sent ? t('home.paidTo', { name: tx.customerName }) : t('home.receivedFrom', { name: tx.customerName })}
                          </Typography>
                          <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                            {fmtWhen(tx.createdAt)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 14.5, flexShrink: 0, color: sent ? c.redDeep : c.greenDeep }} noWrap>
                          {fmt(tx.amount)}
                        </Typography>
                      </ListRow>
                    </Box>
                  );
                })}
              </AppCard>
            </Fade>
          )}
        </Stack>
      </Container>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '28px 28px 0 0',
            bgcolor: c.bg,
            boxShadow: shadow.nav,
            maxHeight: '85vh',
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 4, bgcolor: c.border }} />
        </Box>

        <Box sx={{ px: 2.5, pt: 1, pb: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: c.ink }}>{t('transactions.filters')}</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: c.greyIcon, bgcolor: c.chipGrey }}>
              <X size={16} />
            </IconButton>
          </Stack>

          <SectionLabel c={c}>{t('transactions.dateRangeLabel')}</SectionLabel>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: draftFilters.datePreset === 'custom' ? 2 : 3 }}>
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
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: c.grey, mb: 0.625, fontWeight: 600 }}>{t('transactions.startDate')}</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.875,
                    borderRadius: '12px',
                    border: `1.5px solid ${c.border}`,
                    bgcolor: c.surface,
                    px: 1.25
                  }}
                >
                  <Calendar size={15} color={c.greyLight} style={{ flexShrink: 0 }} />
                  <Box
                    component="input"
                    type="date"
                    value={draftFilters.customStart}
                    onChange={(e: any) => setDraftFilters((f) => ({ ...f, customStart: e.target.value }))}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      bgcolor: 'transparent',
                      color: c.ink,
                      fontFamily: 'inherit',
                      fontSize: 13.5,
                      py: 1.1
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: c.grey, mb: 0.625, fontWeight: 600 }}>{t('transactions.endDate')}</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.875,
                    borderRadius: '12px',
                    border: `1.5px solid ${c.border}`,
                    bgcolor: c.surface,
                    px: 1.25
                  }}
                >
                  <Calendar size={15} color={c.greyLight} style={{ flexShrink: 0 }} />
                  <Box
                    component="input"
                    type="date"
                    value={draftFilters.customEnd}
                    onChange={(e: any) => setDraftFilters((f) => ({ ...f, customEnd: e.target.value }))}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      bgcolor: 'transparent',
                      color: c.ink,
                      fontFamily: 'inherit',
                      fontSize: 13.5,
                      py: 1.1
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          )}

          <Divider sx={{ borderColor: c.line, mb: 2.5 }} />

          <SectionLabel c={c}>{t('transactions.typeLabel')}</SectionLabel>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 3.5 }}>
            {typeOptions.map((opt) => (
              <ChipButton
                key={opt.value}
                c={c}
                label={opt.label}
                icon={opt.icon}
                active={draftFilters.type === opt.value}
                onClick={() => setDraftFilters((f) => ({ ...f, type: opt.value }))}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={resetDraft}>
              {t('common.reset')}
            </Button>
            <Button fullWidth variant="contained" onClick={applyDraft}>
              {t('common.apply')}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default Transactions;
