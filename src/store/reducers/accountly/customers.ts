import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from 'services/accountly/customerService';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest, TransactionType } from 'services/accountly/types';
import { fetchDashboardStatistics } from './dashboard';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  listItems: Customer[];
  listPage: number;
  listHasMore: boolean;
  listLoading: boolean;
  listLoadingMore: boolean;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  hasLoaded: false,
  error: null,
  selectedCustomer: null,
  listItems: [],
  listPage: 0,
  listHasMore: true,
  listLoading: false,
  listLoadingMore: false
};

export const CUSTOMERS_PAGE_SIZE = 20;

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async (_, { rejectWithValue }) => {
  try {
    const data = await customerService.getCustomers();
    return customerService.transformCustomers(data?.customers || []);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch customers');
  }
});

export const fetchCustomersPage = createAsyncThunk('customers/fetchCustomersPage', async (page: number, { rejectWithValue }) => {
  try {
    const data = await customerService.getCustomers({ page, limit: CUSTOMERS_PAGE_SIZE });
    return {
      page,
      items: customerService.transformCustomers(data?.customers || []),
      hasMore: Boolean(data?.has_more)
    };
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch customers');
  }
});

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: CreateCustomerRequest, { rejectWithValue, dispatch }) => {
    try {
      const data = await customerService.createCustomer(customerData);
      dispatch(fetchDashboardStatistics() as any);
      return customerService.transformCustomer((data as any)?.customer || data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }: { id: string; data: UpdateCustomerRequest }, { rejectWithValue, dispatch }) => {
    try {
      const res = await customerService.updateCustomer(id, data);
      dispatch(fetchDashboardStatistics() as any);
      return customerService.transformCustomer(res.customer);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk('customers/deleteCustomer', async (id: string, { rejectWithValue, dispatch }) => {
  try {
    await customerService.deleteCustomer(id);
    dispatch(fetchDashboardStatistics() as any);
    return id;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to delete customer');
  }
});

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCustomerBalance: (
      state,
      action: PayloadAction<{ customerId: string; amount: number; transactionType: TransactionType }>
    ) => {
      const { customerId, amount, transactionType } = action.payload;
      const customer = state.customers.find((c) => c.id === customerId);
      if (customer) {
        const balanceChange = transactionType === 'debit' ? -amount : amount;
        customer.balance = customer.balance + balanceChange;
        if (state.selectedCustomer?.id === customerId) {
          state.selectedCustomer.balance = customer.balance;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.customers = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomersPage.pending, (state, action) => {
        if (action.meta.arg <= 1) state.listLoading = true;
        else state.listLoadingMore = true;
        state.error = null;
      })
      .addCase(fetchCustomersPage.fulfilled, (state, action) => {
        const { page, items, hasMore } = action.payload;
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listPage = page;
        state.listHasMore = hasMore;
        state.listItems = page <= 1 ? items : [...state.listItems, ...items];
      })
      .addCase(fetchCustomersPage.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        if (state.listPage > 0) state.listItems.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.customers[index] = action.payload;
        const listIndex = state.listItems.findIndex((c) => c.id === action.payload.id);
        if (listIndex !== -1) state.listItems[listIndex] = action.payload;
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter((c) => c.id !== action.payload);
        state.listItems = state.listItems.filter((c) => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedCustomer, clearError, updateCustomerBalance } = customerSlice.actions;
export default customerSlice.reducer;
