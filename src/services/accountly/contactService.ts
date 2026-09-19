import axios from 'utils/axios';
import { ContactLabel, ApiContact, CreateContactRequest, UpdateContactRequest, Contact } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const contactService = {
  async getContacts(params?: {
    page?: number;
    limit?: number;
    label?: ContactLabel | null;
  }): Promise<{ contacts: ApiContact[]; total?: number; has_more?: boolean }> {
    const labelQuery = params?.label ? `&label=${params.label}` : '';
    const query = params ? `?page=${params.page ?? 1}&limit=${params.limit ?? 20}${labelQuery}` : '';
    const res = await axios.get(`/api/contact${query}`);
    return unwrap(res);
  },

  async getContactById(id: string): Promise<{ contact: ApiContact }> {
    const res = await axios.get(`/api/contact/${id}`);
    return unwrap(res);
  },

  async createContact(data: CreateContactRequest): Promise<{ contact: ApiContact }> {
    const res = await axios.post('/api/contact', data);
    return unwrap(res);
  },

  async updateContact(id: string, data: UpdateContactRequest): Promise<{ contact: ApiContact }> {
    const res = await axios.put(`/api/contact/${id}`, data);
    return unwrap(res);
  },

  async deleteContact(id: string): Promise<{ message: string }> {
    const res = await axios.delete(`/api/contact/${id}`);
    return unwrap(res);
  },

  transformContact(apiContact: ApiContact): Contact {
    const createdAt = apiContact.createdAt || apiContact.created_at || '';
    const updatedAt = apiContact.updatedAt || apiContact.updated_at || '';
    return {
      id: apiContact._id,
      name: apiContact.name,
      email: '',
      phone: apiContact.phone,
      address: apiContact.address || '',
      balance: apiContact.balance,
      totalAmount: apiContact.balance,
      paidAmount: apiContact.balance,
      pendingAmount: 0,
      imageUrl: apiContact.image_url || '',
      linkId: apiContact.link_id || null,
      linkStatus: apiContact.link_status || null,
      label: apiContact.label || null,
      status: 'active',
      createdAt,
      updatedAt
    };
  },

  transformContacts(apiContacts: ApiContact[]): Contact[] {
    return (apiContacts || []).map((c) => this.transformContact(c));
  }
};

export default contactService;
