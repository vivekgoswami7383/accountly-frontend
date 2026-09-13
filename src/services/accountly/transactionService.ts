import axios from 'utils/axios';
import { CreateTransactionRequest, TransactionFilter } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const transactionService = {
  async createTransaction(data: CreateTransactionRequest) {
    const res = await axios.post('/api/transaction', data);
    return unwrap(res);
  },

  async getTransactions(filter?: TransactionFilter, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (filter) query.set('filter', JSON.stringify(filter));
    if (params) {
      query.set('page', String(params.page ?? 1));
      query.set('limit', String(params.limit ?? 20));
    }
    const qs = query.toString();
    const res = await axios.get(`/api/transaction${qs ? `?${qs}` : ''}`);
    return unwrap(res);
  },

  async getCustomerTransactions(customerId: string) {
    const res = await axios.get(`/api/transaction/customer/${customerId}`);
    return unwrap(res);
  },

  async getTransactionById(id: string) {
    const res = await axios.get(`/api/transaction/${id}`);
    return unwrap(res).transaction;
  },

  async updateTransaction(id: string, data: Partial<CreateTransactionRequest>) {
    const res = await axios.put(`/api/transaction/${id}`, data);
    return unwrap(res);
  },

  async deleteTransaction(id: string) {
    const res = await axios.delete(`/api/transaction/${id}`);
    return unwrap(res);
  },

  async getReport(params: { start: string; end: string }) {
    const query = new URLSearchParams({ start: params.start, end: params.end });
    const res = await axios.get(`/api/transaction/report?${query.toString()}`);
    return unwrap(res);
  }
};

export default transactionService;
