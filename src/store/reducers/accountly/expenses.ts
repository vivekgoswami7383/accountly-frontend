import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import expenseService from 'services/accountly/expenseService';
import { CreateExpenseRequest, Expense, ExpenseFilter, ExpenseSummary } from 'services/accountly/types';

interface ExpenseState {
  expenses: Expense[];
  hasLoadedGlobal: boolean;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  loading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
  summary: ExpenseSummary | null;
  summaryLoading: boolean;
}

const initialState: ExpenseState = {
  expenses: [],
  hasLoadedGlobal: false,
  page: 0,
  hasMore: true,
  loadingMore: false,
  loading: false,
  error: null,
  selectedExpense: null,
  summary: null,
  summaryLoading: false
};

export const EXPENSES_PAGE_SIZE = 20;

const mapExpense = (e: any): Expense => ({
  id: e._id,
  amount: e.amount,
  category: e.category,
  note: e.note || '',
  expenseDate: e.expense_date || e.expenseDate,
  createdAt: e.created_at || e.createdAt,
  updatedAt: e.updated_at || e.updatedAt
});

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (data: CreateExpenseRequest, { rejectWithValue }) => {
    try {
      const res = await expenseService.createExpense(data);
      return res.expense;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create expense');
    }
  }
);

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params: { filter?: ExpenseFilter; page: number; append?: boolean }, { rejectWithValue }) => {
    try {
      const data = await expenseService.getExpenses(params.filter, { page: params.page, limit: EXPENSES_PAGE_SIZE });
      return {
        page: params.page,
        append: Boolean(params.append),
        items: Array.isArray(data?.expenses) ? data.expenses : [],
        hasMore: Boolean(data?.has_more)
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  'expenses/fetchExpenseById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await expenseService.getExpenseById(id);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch expense');
    }
  }
);

export const updateExpenseById = createAsyncThunk(
  'expenses/updateExpenseById',
  async (params: { id: string; data: Partial<CreateExpenseRequest> }, { rejectWithValue }) => {
    try {
      const res = await expenseService.updateExpense(params.id, params.data);
      return res.expense;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpenseById = createAsyncThunk(
  'expenses/deleteExpenseById',
  async (params: { id: string }, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(params.id);
      return { expenseId: params.id };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to delete expense');
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchExpenseSummary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await expenseService.getExpenseSummary();
      const summary: ExpenseSummary = {
        todayTotal: data?.today_total || 0,
        weekTotal: data?.week_total || 0,
        monthTotal: data?.month_total || 0,
        monthCount: data?.month_count || 0,
        categoryTotals: Array.isArray(data?.category_totals) ? data.category_totals : []
      };
      return summary;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch expense summary');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(mapExpense(action.payload));
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExpenses.pending, (state, action) => {
        if (action.meta.arg.append) state.loadingMore = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        const { page, append, items, hasMore } = action.payload;
        state.loading = false;
        state.loadingMore = false;
        state.hasLoadedGlobal = true;
        state.page = page;
        state.hasMore = hasMore;
        const mapped = items.map(mapExpense);
        state.expenses = append ? [...state.expenses, ...mapped] : mapped;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedExpense = mapExpense(action.payload);
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        const mapped = mapExpense(action.payload);
        const index = state.expenses.findIndex((e) => e.id === mapped.id);
        if (index !== -1) state.expenses[index] = mapped;
        state.selectedExpense = mapped;
      })
      .addCase(updateExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        const { expenseId } = action.payload;
        state.expenses = state.expenses.filter((e) => e.id !== expenseId);
        if (state.selectedExpense?.id === expenseId) state.selectedExpense = null;
      })
      .addCase(deleteExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExpenseSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchExpenseSummary.rejected, (state) => {
        state.summaryLoading = false;
      });
  }
});

export const { setSelectedExpense, setError } = expenseSlice.actions;
export default expenseSlice.reducer;
