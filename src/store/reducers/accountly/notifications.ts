import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from 'services/accountly/notificationService';
import { ApiNotification } from 'services/accountly/types';

export const NOTIFICATIONS_PAGE_SIZE = 20;

interface NotificationsState {
  items: ApiNotification[];
  page: number;
  hasMore: boolean;
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasLoaded: boolean;
  readEpoch: number;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  page: 0,
  hasMore: false,
  unreadCount: 0,
  loading: false,
  loadingMore: false,
  hasLoaded: false,
  readEpoch: 0,
  error: null
};

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async (_, { rejectWithValue, getState }) => {
  const epoch = (getState() as { notifications: NotificationsState }).notifications.readEpoch;
  try {
    const res = await notificationService.getUnreadCount();
    return { count: res.unread_count, epoch };
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch notifications');
  }
});

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page }: { page: number }, { rejectWithValue }) => {
    try {
      const res = await notificationService.getNotifications(page, NOTIFICATIONS_PAGE_SIZE);
      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationService.markAllRead();
    return 0;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to update notifications');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        if (action.payload.epoch === state.readEpoch) state.unreadCount = action.payload.count;
      })
      .addCase(fetchNotifications.pending, (state, action) => {
        state.error = null;
        if (action.meta.arg.page === 1) {
          state.loading = true;
          state.items = [];
          state.page = 0;
          state.hasMore = false;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.hasLoaded = true;
        state.page = action.payload.page;
        state.hasMore = action.payload.has_more;
        state.unreadCount = action.payload.unread_count;
        state.items = action.payload.page === 1 ? action.payload.notifications : [...state.items, ...action.payload.notifications];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.readEpoch += 1;
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.readEpoch += 1;
        state.unreadCount = action.payload;
        const now = new Date().toISOString();
        state.items.forEach((item) => {
          if (!item.read_at) item.read_at = now;
        });
      });
  }
});

export default notificationsSlice.reducer;
