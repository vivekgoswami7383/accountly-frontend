import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from 'services/accountly/transactionService';
import { CreateTransactionRequest, TransactionFilter, Transaction } from 'services/accountly/types';
import { updateContactBalance, setContactBalance, setContactDue, deleteContact, createContact } from './contacts';
import { fetchDashboardStatistics } from './dashboard';

interface TransactionState {
  transactions: Transaction[];
  hasLoadedGlobal: boolean;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  contactTransactions: Transaction[];
  loadedContactId: string | null;
  loading: boolean;
  error: string | null;
  selectedTransaction: Transaction | null;
  contactStats: {
    totalTransactions: number;
    contactBalance: number | null;
  };
}

const initialState: TransactionState = {
  transactions: [],
  hasLoadedGlobal: false,
  page: 0,
  hasMore: true,
  loadingMore: false,
  contactTransactions: [],
  loadedContactId: null,
  loading: false,
  error: null,
  selectedTransaction: null,
  contactStats: { totalTransactions: 0, contactBalance: null }
};

export const TRANSACTIONS_PAGE_SIZE = 20;

const mapTx = (tx: any): Transaction => ({
  id: tx._id,
  contactId: tx.contact._id,
  contactName: tx.contact.name,
  amount: tx.amount,
  transaction_type: tx.transaction_type,
  description: tx.description || '',
  createdAt: tx.created_at || tx.createdAt,
  updatedAt: tx.updated_at || tx.updatedAt,
  ...(tx.balance_after != null ? { balanceAfter: tx.balance_after } : {}),
  ...(tx.attachment_url ? { attachmentUrl: tx.attachment_url } : {})
});

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: CreateTransactionRequest, { rejectWithValue, dispatch }) => {
    try {
      const res = await transactionService.createTransaction(data);
      dispatch(
        updateContactBalance({
          contactId: data.contact._id,
          amount: data.amount,
          transactionType: data.transaction_type
        })
      );
      if (data.due_date && data.transaction_type === 'debit' && res.contact_balance < 0) {
        dispatch(setContactDue({ contactId: data.contact._id, dueDate: data.due_date }));
      }
      dispatch(fetchDashboardStatistics() as any);
      return { transaction: res.transaction, contactBalance: res.contact_balance };
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

export const fetchContactTransactions = createAsyncThunk(
  'transactions/fetchContactTransactions',
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getContactTransactions(contactId);
      return { contactId, response };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch contact transactions');
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
      if (res.contact_balance != null) {
        dispatch(setContactBalance({ contactId: res.transaction.contact._id, balance: res.contact_balance }));
      }
      dispatch(fetchDashboardStatistics() as any);
      return { transaction: res.transaction, contactBalance: res.contact_balance };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransactionById = createAsyncThunk(
  'transactions/deleteTransactionById',
  async (params: { id: string; contactId: string }, { rejectWithValue, dispatch }) => {
    try {
      const res = await transactionService.deleteTransaction(params.id);
      if (res?.contact_balance != null) {
        dispatch(setContactBalance({ contactId: params.contactId, balance: res.contact_balance }));
      }
      dispatch(fetchDashboardStatistics() as any);
      return { transactionId: params.id, contactBalance: res?.contact_balance };
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
    resetContactView: (state, action: PayloadAction<string>) => {
      if (state.loadedContactId === action.payload) return;
      state.contactTransactions = [];
      state.contactStats = { totalTransactions: 0, contactBalance: null };
      state.loadedContactId = null;
      state.loading = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteContact.fulfilled, (state, action) => {
        const contactId = action.payload;
        state.transactions = state.transactions.filter((t) => t.contactId !== contactId);
        if (state.loadedContactId === contactId) {
          state.contactTransactions = [];
          state.contactStats = { totalTransactions: 0, contactBalance: null };
          state.loadedContactId = null;
        }
        if (state.selectedTransaction?.contactId === contactId) state.selectedTransaction = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        if (state.loadedContactId === action.payload.id) {
          state.contactTransactions = [];
          state.contactStats = { totalTransactions: 0, contactBalance: null };
          state.loadedContactId = null;
        }
        state.transactions = state.transactions.filter((t) => t.contactId !== action.payload.id);
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const mapped = mapTx(action.payload.transaction);
        state.transactions.unshift(mapped);
        if (state.loadedContactId === mapped.contactId) {
          state.contactTransactions.unshift(mapped);
          if (action.payload.contactBalance != null) {
            state.contactStats.contactBalance = action.payload.contactBalance;
            state.contactStats.totalTransactions += 1;
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
      .addCase(fetchContactTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactTransactions.fulfilled, (state, action) => {
        state.loading = false;
        const { contactId, response } = action.payload as any;
        state.contactTransactions = (response.transactions || []).map(mapTx);
        state.contactStats = {
          totalTransactions: (response.transactions || []).length,
          contactBalance: response.contact_balance
        };
        state.loadedContactId = contactId;
      })
      .addCase(fetchContactTransactions.rejected, (state, action) => {
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
        const contactIndex = state.contactTransactions.findIndex((t) => t.id === mapped.id);
        if (contactIndex !== -1) state.contactTransactions[contactIndex] = mapped;
        state.selectedTransaction = mapped;
        if (state.loadedContactId === mapped.contactId && action.payload.contactBalance != null) {
          state.contactStats.contactBalance = action.payload.contactBalance;
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
        const { transactionId: deletedId, contactBalance } = action.payload;
        const deletedTx =
          state.contactTransactions.find((t) => t.id === deletedId) || state.transactions.find((t) => t.id === deletedId);
        state.transactions = state.transactions.filter((t) => t.id !== deletedId);
        state.contactTransactions = state.contactTransactions.filter((t) => t.id !== deletedId);
        if (state.selectedTransaction?.id === deletedId) state.selectedTransaction = null;
        if (deletedTx && state.loadedContactId === deletedTx.contactId && contactBalance != null) {
          state.contactStats.contactBalance = contactBalance;
          state.contactStats.totalTransactions = Math.max(0, state.contactStats.totalTransactions - 1);
        }
      })
      .addCase(deleteTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedTransaction, setError, resetContactView } = transactionSlice.actions;
export default transactionSlice.reducer;
