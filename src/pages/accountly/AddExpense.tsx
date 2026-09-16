import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Calendar, ChevronDown, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { createExpense, fetchExpenseById, updateExpenseById } from 'store/reducers/accountly/expenses';
import { ExpenseCategory } from 'services/accountly/types';
import useSnackbar from 'hooks/useSnackbar';
import useCalculatorInput from 'hooks/useCalculatorInput';
import { MAX_AMOUNT } from 'utils/accountly/calculator';
import { EXPENSE_CATEGORY_ICONS, EXPENSE_CATEGORY_LIST, expenseCategoryLabelKey } from 'utils/accountly/expenseCategories';
import { getCurrency } from 'data/currencies';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import CalculatorKeypad from 'components/accountly/CalculatorKeypad';
import useConfig from 'hooks/useConfig';

const toDateInputValue = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const todayStr = () => toDateInputValue(new Date());

const formatPillDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AddExpense = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: expenseId } = useParams();
  const { showSnackbar } = useSnackbar();
  const c = useAccountlyColors();
  const t = useT();
  const { currency } = useConfig();
  const currencySymbol = getCurrency(currency).symbol;

  const { selectedExpense, loading } = useSelector((s) => s.expenses);

  const calc = useCalculatorInput();
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStr());
  const [initialDate, setInitialDate] = useState(todayStr());
  const [amountError, setAmountError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(true);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const loadedRef = useRef(false);
  const amountBoxRef = useRef<HTMLElement | null>(null);
  const bottomPanelRef = useRef<HTMLElement | null>(null);

  const isEdit = Boolean(expenseId);

  useEffect(() => {
    if (expenseId) dispatch(fetchExpenseById(expenseId));
  }, [dispatch, expenseId]);

  useEffect(() => {
    if (expenseId && selectedExpense && selectedExpense.id === expenseId && !loadedRef.current) {
      loadedRef.current = true;
      calc.setFromAmount(selectedExpense.amount);
      setCategory(selectedExpense.category);
      setNote(selectedExpense.note || '');
      const loadedDate = toDateInputValue(new Date(selectedExpense.expenseDate));
      setDate(loadedDate);
      setInitialDate(loadedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId, selectedExpense]);

  const title = isEdit ? t('expense.editEntry') : t('expense.newEntry');
  const accent = c.red;
  const accentDeep = c.redDeep;

  const openCalculator = () => {
    setCalculatorOpen(true);
    noteRef.current?.blur();
  };

  useEffect(() => {
    if (!calculatorOpen) return undefined;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (amountBoxRef.current?.contains(target)) return;
      if (bottomPanelRef.current?.contains(target)) return;
      setCalculatorOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [calculatorOpen]);

  const handleSubmit = async () => {
    const value = calc.amount;
    let hasError = false;
    if (!calc.expression || isNaN(value) || value <= 0 || value > MAX_AMOUNT) {
      setAmountError(true);
      hasError = true;
    }
    if (!category) {
      setCategoryError(true);
      hasError = true;
    }
    if (hasError) return;

    const expense_date = date !== initialDate ? new Date(`${date}T12:00:00`).toISOString() : undefined;

    if (isEdit && expenseId) {
      const result = await dispatch(
        updateExpenseById({
          id: expenseId,
          data: { amount: value, category: category as ExpenseCategory, note: note.trim() || undefined, expense_date }
        })
      );
      if (updateExpenseById.fulfilled.match(result)) navigate(-1);
      else showSnackbar({ message: (result.payload as string) || t('expense.failedUpdateEntry'), type: 'error' });
      return;
    }

    const result = await dispatch(
      createExpense({
        amount: value,
        category: category as ExpenseCategory,
        note: note.trim() || '',
        expense_date
      })
    );
    if (createExpense.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || t('expense.failedRecordEntry'), type: 'error' });
  };

  const keypadHandlers = {
    onDigit: (d: string) => {
      setAmountError(false);
      calc.pressDigit(d);
    },
    onDot: () => {
      setAmountError(false);
      calc.pressDot();
    },
    onOperator: (op: string) => calc.pressOperator(op),
    onClear: calc.pressClear,
    onBackspace: calc.pressBackspace,
    onEquals: calc.pressEquals,
    onMemoryAdd: calc.pressMemoryAdd,
    onMemorySubtract: calc.pressMemorySubtract,
    onRecallMemory: calc.recallMemory
  };

  return (
    <>
      <AppHeader
        variant="screen"
        title={
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, color: accentDeep }} noWrap>
            {title}
          </Typography>
        }
      />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.5, pb: 'calc(500px + env(safe-area-inset-bottom, 0px))' }}>
        <Stack spacing={2.25}>
          <Box
            component="button"
            ref={amountBoxRef}
            onClick={openCalculator}
            sx={{
              bgcolor: c.surface,
              borderRadius: '20px',
              boxShadow: '0 1px 2px rgba(20,23,26,0.04)',
              border: `1.5px solid ${amountError ? c.red : calculatorOpen ? accent : c.border}`,
              px: 2.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 24, color: c.greyLight }}>{currencySymbol}</Typography>
            <Typography
              sx={{
                flex: '0 1 auto',
                minWidth: 0,
                fontFamily: DISPLAY,
                fontWeight: 500,
                fontSize: calc.display.length > 12 ? 18 : 26,
                letterSpacing: '-0.02em',
                color: accentDeep,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {calc.display || <Box component="span" sx={{ color: c.greyIcon }}>0</Box>}
            </Typography>
            {calculatorOpen && (
              <Box
                sx={{
                  width: 2,
                  height: 20,
                  bgcolor: accentDeep,
                  flexShrink: 0,
                  animation: 'accountlyBlink 1s step-end infinite',
                  '@keyframes accountlyBlink': { '50%': { opacity: 0 } }
                }}
              />
            )}
          </Box>

          <Box>
            <Typography sx={{ color: c.grey, fontSize: 12, fontWeight: 500, mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('expenses.categoryLabel')}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {EXPENSE_CATEGORY_LIST.map((cat) => {
                const Icon = EXPENSE_CATEGORY_ICONS[cat];
                const active = category === cat;
                return (
                  <Box
                    key={cat}
                    component="button"
                    onClick={() => {
                      setCategoryError(false);
                      setCategory(cat);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.625,
                      border: active ? 'none' : `1.5px solid ${categoryError ? c.red : c.border}`,
                      bgcolor: active ? accent : c.surface,
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
                    <Icon size={14} />
                    {t(expenseCategoryLabelKey(cat))}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Box
            sx={{
              bgcolor: c.surface,
              borderRadius: '14px',
              border: `1.5px solid ${c.border}`,
              px: 2,
              py: 1.75,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25
            }}
          >
            <FileText size={20} color={c.greyLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <Box
              component="textarea"
              ref={noteRef}
              rows={2}
              placeholder={t('expense.addNote')}
              value={note}
              onFocus={() => setCalculatorOpen(false)}
              onChange={(e: any) => setNote(e.target.value)}
              maxLength={200}
              sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                resize: 'none',
                bgcolor: 'transparent',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: c.ink,
                '::placeholder': { color: c.greyLight }
              }}
            />
          </Box>

          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              borderRadius: '14px',
              border: `1.5px solid ${c.border}`,
              bgcolor: c.surface,
              px: 1.5,
              py: 1.25
            }}
          >
            <Calendar size={16} color={c.greyLight} style={{ flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: c.ink }} noWrap>
              {formatPillDate(date)}
            </Typography>
            <Box
              component="input"
              type="date"
              value={date}
              max={todayStr()}
              onFocus={() => setCalculatorOpen(false)}
              onChange={(e: any) => setDate(e.target.value)}
              sx={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        </Stack>
      </Container>

      <Box
        ref={bottomPanelRef}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 25,
          bgcolor: c.surface,
          borderTop: `1px solid ${c.line}`,
          boxShadow: '0 -8px 24px -12px rgba(20,23,26,0.12)',
          pt: 1.5,
          pb: 'calc(14px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <Container maxWidth="sm" sx={{ px: 2.25 }}>
          {calculatorOpen ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <Box
                  component="button"
                  onClick={() => setCalculatorOpen(false)}
                  aria-label="Collapse calculator"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 22,
                    border: 'none',
                    bgcolor: 'transparent',
                    color: c.greyIcon,
                    cursor: 'pointer'
                  }}
                >
                  <ChevronDown size={20} />
                </Box>
              </Box>
              <CalculatorKeypad
                accent={accent}
                accentDeep={accentDeep}
                memory={calc.memory}
                {...keypadHandlers}
                onSubmit={handleSubmit}
                submitDisabled={loading}
                submitLabel={loading ? t('common.saving') : isEdit ? t('expense.update') : t('expense.saveEntry')}
              />
            </Box>
          ) : (
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={{ bgcolor: accent, boxShadow: 'none', '&:hover': { bgcolor: accentDeep } }}
            >
              {loading ? t('common.saving') : isEdit ? t('expense.update') : t('expense.saveEntry')}
            </Button>
          )}
        </Container>
      </Box>
    </>
  );
};

export default AddExpense;
