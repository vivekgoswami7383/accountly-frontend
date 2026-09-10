import axios from 'utils/axios';
import { ApiCustomer, CreateCustomerRequest, UpdateCustomerRequest, Customer } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const customerService = {
  async getCustomers(): Promise<{ customers: ApiCustomer[] }> {
    const res = await axios.get('/api/customer');
    return unwrap(res);
  },

  async getCustomerById(id: string): Promise<{ customer: ApiCustomer }> {
    const res = await axios.get(`/api/customer/${id}`);
    return unwrap(res);
  },

  async createCustomer(data: CreateCustomerRequest): Promise<{ customer: ApiCustomer }> {
    const res = await axios.post('/api/customer', data);
    return unwrap(res);
  },

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<{ customer: ApiCustomer }> {
    const res = await axios.put(`/api/customer/${id}`, data);
    return unwrap(res);
  },

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const res = await axios.delete(`/api/customer/${id}`);
    return unwrap(res);
  },

  transformCustomer(apiCustomer: ApiCustomer): Customer {
    const createdAt = apiCustomer.createdAt || apiCustomer.created_at || '';
    const updatedAt = apiCustomer.updatedAt || apiCustomer.updated_at || '';
    return {
      id: apiCustomer._id,
      name: apiCustomer.name,
      email: '',
      phone: apiCustomer.phone,
      address: apiCustomer.address || '',
      balance: apiCustomer.balance,
      totalAmount: apiCustomer.balance,
      paidAmount: apiCustomer.balance,
      pendingAmount: 0,
      status: 'active',
      createdAt,
      updatedAt
    };
  },

  transformCustomers(apiCustomers: ApiCustomer[]): Customer[] {
    return (apiCustomers || []).map((c) => this.transformCustomer(c));
  }
};

export default customerService;
