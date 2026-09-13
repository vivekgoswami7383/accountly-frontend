import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from 'services/accountly/transactionService';
import { BusinessReport } from 'services/accountly/types';

interface ReportsState {
  report: BusinessReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  report: null,
  loading: false,
  error: null
};

export const fetchBusinessReport = createAsyncThunk(
  'reports/fetchBusinessReport',
  async (params: { start: string; end: string }, { rejectWithValue }) => {
    try {
      const data = await transactionService.getReport(params);
      const report: BusinessReport = {
        totals: {
          collected: data?.totals?.collected || 0,
          given: data?.totals?.given || 0,
          net: data?.totals?.net || 0,
          transactionCount: data?.totals?.transaction_count || 0
        },
        daily: Array.isArray(data?.daily) ? data.daily : [],
        topCustomers: Array.isArray(data?.top_customers)
          ? data.top_customers.map((c: any) => ({ id: c._id, name: c.name, phone: c.phone, balance: c.balance }))
          : []
      };
      return report;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchBusinessReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default reportsSlice.reducer;
