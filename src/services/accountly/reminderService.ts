import axios from 'utils/axios';
import { ApiReminder, ReminderRequest, ReminderView } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const reminderService = {
  async getReminders(view: ReminderView, page: number, limit = 20): Promise<{ reminders: ApiReminder[]; has_more: boolean }> {
    const res = await axios.get(`/api/reminder?view=${view}&page=${page}&limit=${limit}`);
    return unwrap(res);
  },

  async getReminder(id: string): Promise<ApiReminder> {
    const res = await axios.get(`/api/reminder/${id}`);
    return unwrap(res).reminder;
  },

  async createReminder(data: ReminderRequest): Promise<ApiReminder> {
    const res = await axios.post('/api/reminder', data);
    return unwrap(res).reminder;
  },

  async updateReminder(id: string, data: Partial<ReminderRequest>): Promise<ApiReminder> {
    const res = await axios.put(`/api/reminder/${id}`, data);
    return unwrap(res).reminder;
  },

  async deleteReminder(id: string) {
    const res = await axios.delete(`/api/reminder/${id}`);
    return unwrap(res);
  },

  async markDone(id: string): Promise<ApiReminder> {
    const res = await axios.post(`/api/reminder/${id}/done`);
    return unwrap(res).reminder;
  },

  async snooze(id: string, minutes: number): Promise<ApiReminder> {
    const res = await axios.post(`/api/reminder/${id}/snooze`, { minutes });
    return unwrap(res).reminder;
  }
};

export default reminderService;
