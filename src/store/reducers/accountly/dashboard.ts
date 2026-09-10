import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from 'services/accountly/dashboardService';
import { DashboardStats, RecentCustomer, ApiTransaction, Transaction } from 'services/accountly/types';

interface DashboardState {
  stats: DashboardStats | null;
  recentCustomers: RecentCustomer[];
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentCustomers: [],
  recentTransactions: [],
  loading: false,
  error: null
};

export const fetchDashboardStatistics = createAsyncThunk('dashboard/fetchDashboardStatistics', async (_, { rejectWithValue }) => {
  try {
    return await dashboardService.getDashboardStatistics();
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch dashboard statistics');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.recentCustomers = action.payload.recent_customers || [];
        state.recentTransactions = (action.payload.recent_transactions || []).map((t: ApiTransaction) => ({
          id: t._id,
          customerId: t.customer._id,
          customerName: t.customer.name,
          amount: t.amount,
          transaction_type: t.transaction_type,
          description: t.description || '',
          createdAt: t.created_at,
          updatedAt: t.updated_at
        }));
        state.error = null;
      })
      .addCase(fetchDashboardStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
