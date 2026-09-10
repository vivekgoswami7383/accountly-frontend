import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from 'services/accountly/customerService';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from 'services/accountly/types';
import { fetchDashboardStatistics } from './dashboard';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  selectedCustomer: null
};

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async (_, { rejectWithValue }) => {
  try {
    const data = await customerService.getCustomers();
    return customerService.transformCustomers(data?.customers || []);
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
      action: PayloadAction<{ customerId: string; amount: number; transactionType: 'sent' | 'received' }>
    ) => {
      const { customerId, amount, transactionType } = action.payload;
      const customer = state.customers.find((c) => c.id === customerId);
      if (customer) {
        const balanceChange = transactionType === 'sent' ? -amount : amount;
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
        state.customers = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
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
