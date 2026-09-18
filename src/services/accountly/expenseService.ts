import axios from 'utils/axios';
import { CreateExpenseRequest, ExpenseFilter } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const expenseService = {
  async createExpense(data: CreateExpenseRequest) {
    const res = await axios.post('/api/expense', data);
    return unwrap(res);
  },

  async getExpenses(filter?: ExpenseFilter, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (filter) query.set('filter', JSON.stringify(filter));
    if (params) {
      query.set('page', String(params.page ?? 1));
      query.set('limit', String(params.limit ?? 20));
    }
    const qs = query.toString();
    const res = await axios.get(`/api/expense${qs ? `?${qs}` : ''}`);
    return unwrap(res);
  },

  async getExpenseById(id: string) {
    const res = await axios.get(`/api/expense/${id}`);
    return unwrap(res).expense;
  },

  async updateExpense(id: string, data: Partial<CreateExpenseRequest>) {
    const res = await axios.put(`/api/expense/${id}`, data);
    return unwrap(res);
  },

  async deleteExpense(id: string) {
    const res = await axios.delete(`/api/expense/${id}`);
    return unwrap(res);
  },

  async getExpenseSummary() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - ((todayStart.getDay() + 6) % 7));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const res = await axios.get('/api/expense/summary', {
      params: {
        today_start: todayStart.toISOString(),
        week_start: weekStart.toISOString(),
        month_start: monthStart.toISOString()
      }
    });
    return unwrap(res);
  }
};

export default expenseService;
