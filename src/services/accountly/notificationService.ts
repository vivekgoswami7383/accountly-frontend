import axios from 'utils/axios';
import { ApiNotification } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const notificationService = {
  async getNotifications(page: number, limit = 20): Promise<{ notifications: ApiNotification[]; has_more: boolean; unread_count: number }> {
    const res = await axios.get(`/api/notification?page=${page}&limit=${limit}`);
    return unwrap(res);
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const res = await axios.get('/api/notification/unread-count');
    return unwrap(res);
  },

  async markAllRead(): Promise<{ unread_count: number }> {
    const res = await axios.put('/api/notification/read-all');
    return unwrap(res);
  }
};

export default notificationService;
