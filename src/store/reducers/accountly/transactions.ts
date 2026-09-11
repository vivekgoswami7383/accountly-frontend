import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from 'services/accountly/transactionService';
import { CreateTransactionRequest, TransactionFilter, Transaction } from 'services/accountly/types';
import { updateCustomerBalance } from './customers';
import { fetchDashboardStatistics } from './dashboard';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  selectedTransaction: Transaction | null;
  customerStats: {
    totalTransactions: number;
    customerBalance: number;
  };
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
  selectedTransaction: null,
  customerStats: { totalTransactions: 0, customerBalance: 0 }
};

const mapTx = (tx: any): Transaction => ({
  id: tx._id,
  customerId: tx.customer._id,
  customerName: tx.customer.name,
  amount: tx.amount,
  transaction_type: tx.transaction_type,
  description: tx.description || '',
  createdAt: tx.created_at || tx.createdAt,
  updatedAt: tx.updated_at || tx.updatedAt
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
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create transaction');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filter: TransactionFilter | undefined, { rejectWithValue }) => {
    try {
      return await transactionService.getTransactions(filter);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchCustomerTransactions = createAsyncThunk(
  'transactions/fetchCustomerTransactions',
  async (customerId: string, { rejectWithValue }) => {
    try {
      return await transactionService.getCustomerTransactions(customerId);
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
      const updated = await transactionService.updateTransaction(params.id, params.data);
      dispatch(fetchDashboardStatistics() as any);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransactionById = createAsyncThunk(
  'transactions/deleteTransactionById',
  async (transactionId: string, { rejectWithValue, dispatch }) => {
    try {
      await transactionService.deleteTransaction(transactionId);
      dispatch(fetchDashboardStatistics() as any);
      return transactionId;
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
        state.transactions.unshift(mapTx(action.payload));
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = (action.payload as any)?.data || action.payload;
        const arr = responseData?.transactions || responseData;
        state.transactions = Array.isArray(arr) ? arr.map(mapTx) : [];
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomerTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerTransactions.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload as any;
        state.transactions = (response.transactions || []).map(mapTx);
        state.customerStats = {
          totalTransactions: (response.transactions || []).length,
          customerBalance: response.customer_balance
        };
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
        const mapped = mapTx(action.payload);
        const index = state.transactions.findIndex((t) => t.id === mapped.id);
        if (index !== -1) state.transactions[index] = mapped;
        state.selectedTransaction = mapped;
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
        const deletedId = action.payload as string;
        state.transactions = state.transactions.filter((t) => t.id !== deletedId);
        if (state.selectedTransaction?.id === deletedId) state.selectedTransaction = null;
      })
      .addCase(deleteTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedTransaction, setError } = transactionSlice.actions;
export default transactionSlice.reducer;
