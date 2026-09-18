import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from 'services/accountly/transactionService';
import { CreateTransactionRequest, TransactionFilter, Transaction } from 'services/accountly/types';
import { updateCustomerBalance, setCustomerBalance } from './customers';
import { fetchDashboardStatistics } from './dashboard';

interface TransactionState {
  transactions: Transaction[];
  hasLoadedGlobal: boolean;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  customerTransactions: Transaction[];
  loadedCustomerId: string | null;
  loading: boolean;
  error: string | null;
  selectedTransaction: Transaction | null;
  customerStats: {
    totalTransactions: number;
    customerBalance: number | null;
  };
}

const initialState: TransactionState = {
  transactions: [],
  hasLoadedGlobal: false,
  page: 0,
  hasMore: true,
  loadingMore: false,
  customerTransactions: [],
  loadedCustomerId: null,
  loading: false,
  error: null,
  selectedTransaction: null,
  customerStats: { totalTransactions: 0, customerBalance: null }
};

export const TRANSACTIONS_PAGE_SIZE = 20;

const mapTx = (tx: any): Transaction => ({
  id: tx._id,
  customerId: tx.customer._id,
  customerName: tx.customer.name,
  amount: tx.amount,
  transaction_type: tx.transaction_type,
  description: tx.description || '',
  createdAt: tx.created_at || tx.createdAt,
  updatedAt: tx.updated_at || tx.updatedAt,
  ...(tx.balance_after != null ? { balanceAfter: tx.balance_after } : {}),
  ...(tx.attachment_url ? { attachmentUrl: tx.attachment_url } : {}),
  ...(tx.mirror_of ? { isMirrored: true } : {})
});

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: CreateTransactionRequest, { rejectWithValue, dispatch }) => {
    try {
      const res = await transactionService.createTransaction(data);
      dispatch(
        updateCustomerBalance({
          customerId: data.customer._id,
          amount: data.amount,
          transactionType: data.transaction_type
        })
      );
      dispatch(fetchDashboardStatistics() as any);
      return { transaction: res.transaction, customerBalance: res.customer_balance };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create transaction');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (
    params: { filter?: TransactionFilter; page: number; append?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const data = await transactionService.getTransactions(params.filter, { page: params.page, limit: TRANSACTIONS_PAGE_SIZE });
      return {
        page: params.page,
        append: Boolean(params.append),
        items: Array.isArray(data?.transactions) ? data.transactions : [],
        hasMore: Boolean(data?.has_more)
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchCustomerTransactions = createAsyncThunk(
  'transactions/fetchCustomerTransactions',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getCustomerTransactions(customerId);
      return { customerId, response };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch customer transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      return await transactionService.getTransactionById(transactionId);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch transaction');
    }
  }
);

export const updateTransactionById = createAsyncThunk(
  'transactions/updateTransactionById',
  async (params: { id: string; data: Partial<CreateTransactionRequest> }, { rejectWithValue, dispatch }) => {
    try {
      const res = await transactionService.updateTransaction(params.id, params.data);
      if (res.customer_balance != null) {
        dispatch(setCustomerBalance({ customerId: res.transaction.customer._id, balance: res.customer_balance }));
      }
      dispatch(fetchDashboardStatistics() as any);
      return { transaction: res.transaction, customerBalance: res.customer_balance };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransactionById = createAsyncThunk(
  'transactions/deleteTransactionById',
  async (params: { id: string; customerId: string }, { rejectWithValue, dispatch }) => {
    try {
      const res = await transactionService.deleteTransaction(params.id);
      if (res?.customer_balance != null) {
        dispatch(setCustomerBalance({ customerId: params.customerId, balance: res.customer_balance }));
      }
      dispatch(fetchDashboardStatistics() as any);
      return { transactionId: params.id, customerBalance: res?.customer_balance };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to delete transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetCustomerView: (state, action: PayloadAction<string>) => {
      if (state.loadedCustomerId === action.payload) return;
      state.customerTransactions = [];
      state.customerStats = { totalTransactions: 0, customerBalance: null };
      state.loadedCustomerId = null;
      state.loading = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const mapped = mapTx(action.payload.transaction);
        state.transactions.unshift(mapped);
        if (state.loadedCustomerId === mapped.customerId) {
          state.customerTransactions.unshift(mapped);
          if (action.payload.customerBalance != null) {
            state.customerStats.customerBalance = action.payload.customerBalance;
            state.customerStats.totalTransactions += 1;
          }
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactions.pending, (state, action) => {
        if (action.meta.arg.append) state.loadingMore = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        const { page, append, items, hasMore } = action.payload;
        state.loading = false;
        state.loadingMore = false;
        state.hasLoadedGlobal = true;
        state.page = page;
        state.hasMore = hasMore;
        const mapped = items.map(mapTx);
        state.transactions = append ? [...state.transactions, ...mapped] : mapped;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomerTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerTransactions.fulfilled, (state, action) => {
        state.loading = false;
        const { customerId, response } = action.payload as any;
        state.customerTransactions = (response.transactions || []).map(mapTx);
        state.customerStats = {
          totalTransactions: (response.transactions || []).length,
          customerBalance: response.customer_balance
        };
        state.loadedCustomerId = customerId;
      })
      .addCase(fetchCustomerTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTransaction = mapTx(action.payload);
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        const mapped = mapTx(action.payload.transaction);
        const index = state.transactions.findIndex((t) => t.id === mapped.id);
        if (index !== -1) state.transactions[index] = mapped;
        const customerIndex = state.customerTransactions.findIndex((t) => t.id === mapped.id);
        if (customerIndex !== -1) state.customerTransactions[customerIndex] = mapped;
        state.selectedTransaction = mapped;
        if (state.loadedCustomerId === mapped.customerId && action.payload.customerBalance != null) {
          state.customerStats.customerBalance = action.payload.customerBalance;
        }
      })
      .addCase(updateTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        const { transactionId: deletedId, customerBalance } = action.payload;
        const deletedTx =
          state.customerTransactions.find((t) => t.id === deletedId) || state.transactions.find((t) => t.id === deletedId);
        state.transactions = state.transactions.filter((t) => t.id !== deletedId);
        state.customerTransactions = state.customerTransactions.filter((t) => t.id !== deletedId);
        if (state.selectedTransaction?.id === deletedId) state.selectedTransaction = null;
        if (deletedTx && state.loadedCustomerId === deletedTx.customerId && customerBalance != null) {
          state.customerStats.customerBalance = customerBalance;
          state.customerStats.totalTransactions = Math.max(0, state.customerStats.totalTransactions - 1);
        }
      })
      .addCase(deleteTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedTransaction, setError, resetCustomerView } = transactionSlice.actions;
export default transactionSlice.reducer;
