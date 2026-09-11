import axios from 'utils/axios';
import { CreateTransactionRequest, TransactionFilter } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const transactionService = {
  async createTransaction(data: CreateTransactionRequest) {
    const res = await axios.post('/api/transaction', data);
    return unwrap(res);
  },

  async getTransactions(filter?: TransactionFilter) {
    let endpoint = '/api/transaction';
    if (filter) {
      endpoint = `/api/transaction?filter=${encodeURIComponent(JSON.stringify(filter))}`;
    }
    const res = await axios.get(endpoint);
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
  }
};

export default transactionService;
