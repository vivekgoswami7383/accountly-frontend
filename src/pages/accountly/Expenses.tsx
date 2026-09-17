import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Search, SlidersHorizontal, X, Calendar, ListFilter, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchExpenses, fetchExpenseSummary } from 'store/reducers/accountly/expenses';
import { useFormatAmount, formatDateTime, formatDate } from 'utils/accountly/format';
import {
  DatePreset,
  ExpenseAppliedFilters,
  ExpenseCategoryFilter,
  DEFAULT_EXPENSE_FILTERS,
  getDateRangeForPreset
} from 'utils/accountly/dateFilters';
import { EXPENSE_CATEGORY_ICONS, EXPENSE_CATEGORY_LIST, expenseCategoryLabelKey } from 'utils/accountly/expenseCategories';
import { FilterCondition, ExpenseFilter, Expense } from 'services/accountly/types';
import { AccountlyColors, DISPLAY, shadow, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, ListRow, IconDot } from 'components/accountly/kit';
import onlinePayment from 'assets/images/accountly/illustrations/online-payment.png';

const buildFilter = (filters: ExpenseAppliedFilters): ExpenseFilter | undefined => {
  const conditions: FilterCondition[] = [];
  const range = getDateRangeForPreset(filters.datePreset, filters.customStart, filters.customEnd);
  if (range) {
    conditions.push({ field_name: 'expense_date', operator: 'between', field_value: [range.start.toISOString(), range.end.toISOString()] });
  }
  if (filters.category !== 'all') {
    conditions.push({ field_name: 'category', operator: 'exactmatch', field_value: filters.category });
  }
  if (conditions.length === 0) return { search: [], sort: { expense_date: -1 } };
  return { search: [conditions], sort: { expense_date: -1 } };
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
      fontWeight: 500,
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
  <Typography sx={{ fontWeight: 500, fontSize: 11.5, color: c.grey, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.25 }}>
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

const StatCell = ({ label, amount, loading, fmt, c }: { label: string; amount: number; loading: boolean; fmt: (v: number) => string; c: AccountlyColors }) => (
  <Box sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
    <Typography sx={{ fontSize: 11.5, color: c.grey, fontWeight: 500, mb: 0.375 }}>{label}</Typography>
    {loading ? (
      <Skeleton variant="text" width={70} height={24} sx={{ mx: 'auto' }} />
    ) : (
      <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, color: c.redDeep }} noWrap>
        {fmt(amount)}
      </Typography>
    )}
  </Box>
);

interface ExpenseDayGroup {
  key: string;
  label: string;
  total: number;
  items: Expense[];
}

const groupExpensesByDay = (items: Expense[], t: (key: string) => string): ExpenseDayGroup[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: ExpenseDayGroup[] = [];
  const groupByKey = new Map<string, ExpenseDayGroup>();

  items.forEach((ex) => {
    const d = new Date(ex.expenseDate);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const key = dayStart.toDateString();

    let group = groupByKey.get(key);
    if (!group) {
      const label =
        dayStart.getTime() === today.getTime()
          ? t('transactions.filterToday')
          : dayStart.getTime() === yesterday.getTime()
            ? t('transactions.filterYesterday')
            : formatDate(ex.expenseDate);
      group = { key, label, total: 0, items: [] };
      groupByKey.set(key, group);
      groups.push(group);
    }
    group.total += Number(ex.amount) || 0;
    group.items.push(ex);
  });

  return groups;
};

const Expenses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { expenses, loading, page, hasMore, loadingMore, summary, summaryLoading } = useSelector((s) => s.expenses);
  const [query, setQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<ExpenseAppliedFilters>(DEFAULT_EXPENSE_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ExpenseAppliedFilters>(DEFAULT_EXPENSE_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses({ filter: buildFilter(appliedFilters), page: 1 }));
  }, [dispatch, appliedFilters]);

  useEffect(() => {
    dispatch(fetchExpenseSummary());
  }, [dispatch]);

  const loadMore = () => {
    if (hasMore && !loadingMore) dispatch(fetchExpenses({ filter: buildFilter(appliedFilters), page: page + 1, append: true }));
  };

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading || loadingMore);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter(
      (ex) => ex.note?.toLowerCase().includes(q) || t(expenseCategoryLabelKey(ex.category)).toLowerCase().includes(q) || String(ex.amount).includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, query]);

  const groups = useMemo(() => groupExpensesByDay(filtered, t), [filtered, t]);

  const hasNonDefaultFilter = appliedFilters.datePreset !== 'all' || appliedFilters.category !== 'all';

  const dateOptions: { value: DatePreset; label: string }[] = [
    { value: 'today', label: t('transactions.filterToday') },
    { value: 'yesterday', label: t('transactions.filterYesterday') },
    { value: 'week', label: t('transactions.filterThisWeek') },
    { value: 'month', label: t('transactions.filterThisMonth') },
    { value: 'all', label: t('transactions.filterAllTime') },
    { value: 'custom', label: t('transactions.filterCustomRange') }
  ];

  const categoryOptions: { value: ExpenseCategoryFilter; label: string; icon?: ReactNode }[] = [
    { value: 'all', label: t('expenses.filterAllCategories'), icon: <ListFilter size={14} /> },
    ...EXPENSE_CATEGORY_LIST.map((cat) => {
      const Icon = EXPENSE_CATEGORY_ICONS[cat];
      return { value: cat, label: t(expenseCategoryLabelKey(cat)), icon: <Icon size={14} /> };
    })
  ];

  const dateChipLabel = dateOptions.find((o) => o.value === appliedFilters.datePreset)?.label || '';
  const categoryChipLabel = categoryOptions.find((o) => o.value === appliedFilters.category)?.label || '';

  const openDrawer = () => {
    setDraftFilters(appliedFilters);
    setDrawerOpen(true);
  };

  const applyDraft = () => {
    setAppliedFilters(draftFilters);
    setDrawerOpen(false);
  };

  const resetDraft = () => setDraftFilters(DEFAULT_EXPENSE_FILTERS);

  const addBtn = (
    <Box
      component="button"
      onClick={() => navigate('/expense/new')}
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
      <AppHeader variant="screen" title={t('expenses.title')} right={addBtn} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={1.5}>
          <AppCard sx={{ p: 0, overflow: 'hidden' }}>
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: c.line }} />}>
              <StatCell label={t('transactions.filterToday')} amount={summary?.todayTotal || 0} loading={summaryLoading} fmt={fmt} c={c} />
              <StatCell label={t('transactions.filterThisWeek')} amount={summary?.weekTotal || 0} loading={summaryLoading} fmt={fmt} c={c} />
              <StatCell label={t('transactions.filterThisMonth')} amount={summary?.monthTotal || 0} loading={summaryLoading} fmt={fmt} c={c} />
            </Stack>
          </AppCard>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder={t('expenses.searchExpenses')}
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
                color: hasNonDefaultFilter ? c.redDeep : c.ink,
                boxShadow: '0 1px 2px rgba(20,23,26,0.03)',
                flexShrink: 0
              }}
            >
              <SlidersHorizontal size={19} />
            </IconButton>
          </Stack>

          {hasNonDefaultFilter && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {appliedFilters.datePreset !== 'all' && (
                <FilterChip
                  c={c}
                  label={dateChipLabel}
                  onClear={() => setAppliedFilters((f) => ({ ...f, datePreset: 'all', customStart: '', customEnd: '' }))}
                />
              )}
              {appliedFilters.category !== 'all' && (
                <FilterChip c={c} label={categoryChipLabel} onClear={() => setAppliedFilters((f) => ({ ...f, category: 'all' }))} />
              )}
            </Stack>
          )}

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
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>
                {query || hasNonDefaultFilter ? t('customers.noMatches') : t('expenses.noExpensesYet')}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>{t('expenses.noExpensesSub')}</Typography>
            </AppCard>
          ) : (
            <Fade>
              {groups.map((group) => (
                <Box key={group.key} sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5, mb: 0.75 }}>
                    <Typography sx={{ fontWeight: 500, fontSize: 11.5, color: c.grey, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {group.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 12.5, color: c.greyLight }}>{fmt(group.total)}</Typography>
                  </Stack>
                  <AppCard sx={{ overflow: 'hidden' }}>
                    {group.items.map((ex, i) => {
                      const Icon = EXPENSE_CATEGORY_ICONS[ex.category];
                      return (
                        <Box key={ex.id}>
                          {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                          <ListRow onClick={() => navigate(`/expense/${ex.id}`)}>
                            <IconDot size={44} bg={c.redSoft} fg={c.redDeep}>
                              <Icon />
                            </IconDot>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: c.ink }} noWrap>
                                {t(expenseCategoryLabelKey(ex.category))}
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ minWidth: 0 }}>
                                {ex.note && (
                                  <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500, minWidth: 0, flexShrink: 1 }} noWrap>
                                    {ex.note}
                                  </Typography>
                                )}
                                {ex.note && (
                                  <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500, flexShrink: 0 }}>•</Typography>
                                )}
                                <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500, flexShrink: 0 }} noWrap>
                                  {formatDateTime(ex.expenseDate)}
                                </Typography>
                              </Stack>
                            </Box>
                            <Typography sx={{ fontWeight: 500, fontSize: 14.5, flexShrink: 0, color: c.redDeep }} noWrap>
                              {fmt(ex.amount)}
                            </Typography>
                          </ListRow>
                        </Box>
                      );
                    })}
                  </AppCard>
                </Box>
              ))}

              {hasMore && !query && (
                <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                  {loadingMore && <CircularProgress size={22} sx={{ color: c.red }} />}
                </Box>
              )}
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
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 18, color: c.ink }}>{t('expenses.filters')}</Typography>
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
                <Typography sx={{ fontSize: 11.5, color: c.grey, mb: 0.625, fontWeight: 500 }}>{t('transactions.startDate')}</Typography>
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
                    max={draftFilters.customEnd || undefined}
                    onChange={(e: any) =>
                      setDraftFilters((f) => ({
                        ...f,
                        customStart: e.target.value,
                        customEnd: f.customEnd && e.target.value > f.customEnd ? e.target.value : f.customEnd
                      }))
                    }
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
                <Typography sx={{ fontSize: 11.5, color: c.grey, mb: 0.625, fontWeight: 500 }}>{t('transactions.endDate')}</Typography>
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
                    min={draftFilters.customStart || undefined}
                    onChange={(e: any) =>
                      setDraftFilters((f) => ({
                        ...f,
                        customEnd: f.customStart && e.target.value < f.customStart ? f.customStart : e.target.value
                      }))
                    }
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

          <SectionLabel c={c}>{t('expenses.categoryLabel')}</SectionLabel>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 3.5 }}>
            {categoryOptions.map((opt) => (
              <ChipButton
                key={opt.value}
                c={c}
                label={opt.label}
                icon={opt.icon}
                active={draftFilters.category === opt.value}
                onClick={() => setDraftFilters((f) => ({ ...f, category: opt.value }))}
              />
            ))}
          </Stack>

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

export default Expenses;
