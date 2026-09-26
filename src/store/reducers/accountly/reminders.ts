import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import reminderService from 'services/accountly/reminderService';
import { ApiReminder, ReminderRequest, ReminderView } from 'services/accountly/types';

export const REMINDERS_PAGE_SIZE = 20;

interface ReminderList {
  items: ApiReminder[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}

interface RemindersState {
  upcoming: ReminderList;
  past: ReminderList;
  selected: ApiReminder | null;
  loadingSelected: boolean;
  error: string | null;
}

const emptyList: ReminderList = { items: [], page: 0, hasMore: false, loading: false, loadingMore: false };

const initialState: RemindersState = {
  upcoming: { ...emptyList },
  past: { ...emptyList },
  selected: null,
  loadingSelected: false,
  error: null
};

const messageOf = (error: any, fallback: string) => error?.message || fallback;

export const fetchReminders = createAsyncThunk(
  'reminders/fetchReminders',
  async ({ view, page }: { view: ReminderView; page: number }, { rejectWithValue }) => {
    try {
      const res = await reminderService.getReminders(view, page, REMINDERS_PAGE_SIZE);
      return { view, page, items: res.reminders || [], hasMore: Boolean(res.has_more) };
    } catch (error: any) {
      return rejectWithValue(messageOf(error, 'Failed to fetch reminders'));
    }
  }
);

export const fetchReminderById = createAsyncThunk('reminders/fetchReminderById', async (id: string, { rejectWithValue }) => {
  try {
    return await reminderService.getReminder(id);
  } catch (error: any) {
    return rejectWithValue(messageOf(error, 'Failed to fetch reminder'));
  }
});

export const saveReminder = createAsyncThunk(
  'reminders/saveReminder',
  async ({ id, data }: { id?: string; data: Partial<ReminderRequest> }, { rejectWithValue }) => {
    try {
      return id ? await reminderService.updateReminder(id, data) : await reminderService.createReminder(data as ReminderRequest);
    } catch (error: any) {
      return rejectWithValue(messageOf(error, 'Failed to save reminder'));
    }
  }
);

export const markReminderDone = createAsyncThunk('reminders/markDone', async (id: string, { rejectWithValue }) => {
  try {
    return await reminderService.markDone(id);
  } catch (error: any) {
    return rejectWithValue(messageOf(error, 'Failed to update reminder'));
  }
});

export const snoozeReminder = createAsyncThunk(
  'reminders/snooze',
  async ({ id, minutes }: { id: string; minutes: number }, { rejectWithValue }) => {
    try {
      return await reminderService.snooze(id, minutes);
    } catch (error: any) {
      return rejectWithValue(messageOf(error, 'Failed to snooze reminder'));
    }
  }
);

export const deleteReminder = createAsyncThunk('reminders/delete', async (id: string, { rejectWithValue }) => {
  try {
    await reminderService.deleteReminder(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(messageOf(error, 'Failed to delete reminder'));
  }
});

const removeEverywhere = (state: RemindersState, id: string) => {
  state.upcoming.items = state.upcoming.items.filter((r) => r._id !== id);
  state.past.items = state.past.items.filter((r) => r._id !== id);
};

const place = (state: RemindersState, reminder: ApiReminder) => {
  removeEverywhere(state, reminder._id);
  if (reminder.state === 'scheduled') {
    if (state.upcoming.page === 0) return;
    const items = [...state.upcoming.items, reminder].sort((a, b) => a.remind_at.localeCompare(b.remind_at));
    const last = items[items.length - 1];
    state.upcoming.items = state.upcoming.hasMore && last._id === reminder._id ? items.slice(0, -1) : items;
  } else if (state.past.page > 0) {
    state.past.items.unshift(reminder);
  }
  if (state.selected?._id === reminder._id || !state.selected) state.selected = reminder;
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setSelectedReminder: (state, action: PayloadAction<ApiReminder | null>) => {
      state.selected = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state, action) => {
        const list = state[action.meta.arg.view];
        state.error = null;
        if (action.meta.arg.page === 1) list.loading = true;
        else list.loadingMore = true;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        const { view, page, items, hasMore } = action.payload;
        const list = state[view];
        list.loading = false;
        list.loadingMore = false;
        list.page = page;
        list.hasMore = hasMore;
        list.items = page === 1 ? items : [...list.items, ...items];
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        const list = state[action.meta.arg.view];
        list.loading = false;
        list.loadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(fetchReminderById.pending, (state) => {
        state.loadingSelected = true;
        state.error = null;
      })
      .addCase(fetchReminderById.fulfilled, (state, action) => {
        state.loadingSelected = false;
        state.selected = action.payload;
      })
      .addCase(fetchReminderById.rejected, (state, action) => {
        state.loadingSelected = false;
        state.error = action.payload as string;
      })
      .addCase(saveReminder.fulfilled, (state, action) => place(state, action.payload))
      .addCase(markReminderDone.fulfilled, (state, action) => place(state, action.payload))
      .addCase(snoozeReminder.fulfilled, (state, action) => place(state, action.payload))
      .addCase(deleteReminder.fulfilled, (state, action) => {
        removeEverywhere(state, action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      });
  }
});

export const { setSelectedReminder } = remindersSlice.actions;
export default remindersSlice.reducer;
