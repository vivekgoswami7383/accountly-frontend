import axios from 'utils/axios';

export const businessAPI = {
  getAll: () => axios.get('/api/business'),
  getById: (id: string) => axios.get(`/api/business/${id}`),
  create: (data: any) => axios.post('/api/business', data),
  update: (id: string, data: any) => axios.put(`/api/business/${id}`, data),
  delete: (id: string) => axios.delete(`/api/business/${id}`)
};

export const customerAPI = {
  getAll: () => axios.get('/api/customer'),
  getById: (id: string) => axios.get(`/api/customer/${id}`),
  create: (data: any) => axios.post('/api/customer', data),
  update: (id: string, data: any) => axios.put(`/api/customer/${id}`, data),
  delete: (id: string) => axios.delete(`/api/customer/${id}`)
};

export const transactionAPI = {
  getAll: () => axios.get('/api/transaction'),
  getById: (id: string) => axios.get(`/api/transaction/${id}`),
  create: (data: any) => axios.post('/api/transaction', data),
  update: (id: string, data: any) => axios.put(`/api/transaction/${id}`, data),
  delete: (id: string) => axios.delete(`/api/transaction/${id}`)
};
