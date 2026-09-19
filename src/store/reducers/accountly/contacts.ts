import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import contactService from 'services/accountly/contactService';
import { Contact, CreateContactRequest, UpdateContactRequest, TransactionType, LinkStatus, ContactLabel } from 'services/accountly/types';
import { fetchDashboardStatistics } from './dashboard';

interface ContactState {
  contacts: Contact[];
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  selectedContact: Contact | null;
  listItems: Contact[];
  listPage: number;
  listHasMore: boolean;
  listLoading: boolean;
  listLoadingMore: boolean;
  listLabel: ContactLabel | null;
}

const initialState: ContactState = {
  contacts: [],
  loading: false,
  hasLoaded: false,
  error: null,
  selectedContact: null,
  listItems: [],
  listPage: 0,
  listHasMore: true,
  listLoading: false,
  listLoadingMore: false,
  listLabel: null
};

export const CONTACTS_PAGE_SIZE = 20;

export const fetchContacts = createAsyncThunk('contacts/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    const data = await contactService.getContacts();
    return contactService.transformContacts(data?.contacts || []);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch contacts');
  }
});

export const fetchContactsPage = createAsyncThunk(
  'contacts/fetchContactsPage',
  async ({ page, label }: { page: number; label?: ContactLabel | null }, { getState, rejectWithValue }) => {
    try {
      const activeLabel = label === undefined ? (getState() as any).contacts.listLabel : label;
      const data = await contactService.getContacts({ page, limit: CONTACTS_PAGE_SIZE, label: activeLabel });
      return {
        page,
        label: activeLabel as ContactLabel | null,
        items: contactService.transformContacts(data?.contacts || []),
        hasMore: Boolean(data?.has_more)
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch contacts');
    }
  }
);

export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (contactData: CreateContactRequest, { rejectWithValue, dispatch }) => {
    try {
      const data = await contactService.createContact(contactData);
      dispatch(fetchDashboardStatistics() as any);
      return contactService.transformContact((data as any)?.contact || data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create contact');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, data }: { id: string; data: UpdateContactRequest }, { rejectWithValue, dispatch }) => {
    try {
      const res = await contactService.updateContact(id, data);
      dispatch(fetchDashboardStatistics() as any);
      return contactService.transformContact(res.contact);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update contact');
    }
  }
);

export const refreshAfterLinkChange = () => (dispatch: any) => {
  dispatch(fetchContacts());
  dispatch(fetchContactsPage({ page: 1 }));
  dispatch(fetchDashboardStatistics());
};

export const deleteContact = createAsyncThunk('contacts/deleteContact', async (id: string, { rejectWithValue, dispatch }) => {
  try {
    await contactService.deleteContact(id);
    dispatch(fetchDashboardStatistics() as any);
    return id;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to delete contact');
  }
});

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSelectedContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateContactBalance: (
      state,
      action: PayloadAction<{ contactId: string; amount: number; transactionType: TransactionType }>
    ) => {
      const { contactId, amount, transactionType } = action.payload;
      const balanceChange = transactionType === 'debit' ? -amount : amount;
      const contact = state.contacts.find((c) => c.id === contactId);
      if (contact) contact.balance = contact.balance + balanceChange;
      const listItem = state.listItems.find((c) => c.id === contactId);
      if (listItem) listItem.balance = listItem.balance + balanceChange;
      if (state.selectedContact?.id === contactId) {
        state.selectedContact.balance = state.selectedContact.balance + balanceChange;
      }
    },
    setContactLink: (state, action: PayloadAction<{ contactId: string; linkId: string | null; linkStatus: LinkStatus | null }>) => {
      const { contactId, linkId, linkStatus } = action.payload;
      const apply = (c?: Contact) => {
        if (c) {
          c.linkId = linkId;
          c.linkStatus = linkStatus;
        }
      };
      apply(state.contacts.find((c) => c.id === contactId));
      apply(state.listItems.find((c) => c.id === contactId));
      if (state.selectedContact?.id === contactId) apply(state.selectedContact);
    },
    setContactBalance: (state, action: PayloadAction<{ contactId: string; balance: number }>) => {
      const { contactId, balance } = action.payload;
      const contact = state.contacts.find((c) => c.id === contactId);
      if (contact) contact.balance = balance;
      const listItem = state.listItems.find((c) => c.id === contactId);
      if (listItem) listItem.balance = balance;
      if (state.selectedContact?.id === contactId) {
        state.selectedContact.balance = balance;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.contacts = action.payload;
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchContactsPage.pending, (state, action) => {
        if (action.meta.arg.page <= 1) state.listLoading = true;
        else state.listLoadingMore = true;
        state.error = null;
      })
      .addCase(fetchContactsPage.fulfilled, (state, action) => {
        const { page, items, hasMore, label } = action.payload;
        state.listLabel = label;
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listPage = page;
        state.listHasMore = hasMore;
        state.listItems = page <= 1 ? items : [...state.listItems, ...items];
      })
      .addCase(fetchContactsPage.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts.unshift(action.payload);
        if (state.listPage > 0) state.listItems.unshift(action.payload);
        state.error = null;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contacts.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.contacts[index] = action.payload;
        const listIndex = state.listItems.findIndex((c) => c.id === action.payload.id);
        if (listIndex !== -1) state.listItems[listIndex] = action.payload;
        state.error = null;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = state.contacts.filter((c) => c.id !== action.payload);
        state.listItems = state.listItems.filter((c) => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedContact, clearError, updateContactBalance, setContactBalance, setContactLink } = contactSlice.actions;
export default contactSlice.reducer;
